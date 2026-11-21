import { createServerFn } from "@tanstack/react-start";
import { contactSchema } from "./contact-schema";

// Public by design: only a validated contact insert is permitted, never a read.
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.safeParse(input))
  .handler(async ({ data }) => {
    if (!data.success) return { ok: false, error: "Please check the form fields and try again." };
    const { website, ...message } = data.data;
    if (website) return { ok: false, error: "Your message could not be submitted. Please try again." };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("contact_messages").insert(message);
      if (error) {
        console.error("Contact message save failed", error.code);
        return { ok: false, error: "Your message could not be saved. Please try again shortly." };
      }
      // Do not claim email delivery until Resend has been connected and verified.
      return { ok: true, error: null };
    } catch {
      console.error("Contact message service unavailable");
      return { ok: false, error: "Your message could not be saved. Please try again shortly." };
    }
  });