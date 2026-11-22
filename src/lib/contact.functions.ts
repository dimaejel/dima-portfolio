import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { contactSchema } from "./contact-schema";
import { deliverContactNotification } from "./contact-delivery";

// Public by design: only a validated contact insert is permitted, never a read.
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.safeParse(input))
  .handler(async ({ data }) => {
    if (!data.success) return { ok: false, error: "Please check the form fields and try again." };
    const { website, ...message } = data.data;
    if (website) return { ok: false, error: "Your message could not be submitted. Please try again." };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const rateSecret = process.env["CONTACT_RATE_SECRET"];
      if (!rateSecret) throw new Error("Contact protection unavailable");
      // Only the hosting edge's IP header is trusted. Missing IPs share a conservative limit.
      const visitor = getRequestHeader("cf-connecting-ip") || "unknown-visitor";
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", encoder.encode(rateSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(visitor));
      const visitorKey = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const { data: allowed, error: rateError } = await supabaseAdmin.rpc("claim_contact_submission", { p_key: visitorKey });
      if (rateError) throw new Error("Contact protection unavailable");
      if (!allowed) return { ok: false, error: "Too many messages. Please wait ten minutes before trying again." };
      const id = crypto.randomUUID();
      const submittedAt = new Date().toISOString();
      const { error } = await supabaseAdmin.from("contact_messages").insert({ ...message, id, created_at: submittedAt });
      if (error) {
        console.error("Contact message save failed", error.code);
        return { ok: false, error: "Your message could not be saved. Please try again shortly." };
      }
      // Saving is the submission's success boundary. Email outages must never lose a lead
      // or prompt the visitor to create duplicate submissions.
      const delivered = await deliverContactNotification(message, submittedAt, id, {
        from: process.env["RESEND_FROM_EMAIL"],
        apiKey: process.env["RESEND_API_KEY"],
        gatewayKey: process.env["LOVABLE_API_KEY"],
      });
      return { ok: true, delivered, error: null };
    } catch {
      console.error("Contact message service unavailable");
      return { ok: false, error: "Your message could not be saved. Please try again shortly." };
    }
  });