import { z } from "zod";
import type { ContactInput } from "./contact-schema";
import { contactNotification } from "./contact-notification";

interface DeliveryOptions {
  from?: string | undefined;
  apiKey?: string | undefined;
  gatewayKey?: string | undefined;
}

// Called only on the server. The test sender is permitted for this fixed owner recipient.
export async function deliverContactNotification(
  message: ContactInput,
  submittedAt: string,
  submissionId: string,
  options: DeliveryOptions,
  request: typeof fetch = fetch,
): Promise<boolean> {
  const from = options.from || "onboarding@resend.dev";
  if (!z.string().email().safeParse(from).success || !options.apiKey || !options.gatewayKey) {
    console.error("Contact email configuration unavailable; submission remains saved");
    return false;
  }
  try {
    const response = await request("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.gatewayKey}`,
        "X-Connection-Api-Key": options.apiKey,
        "Idempotency-Key": `contact-${submissionId}`,
      },
      body: JSON.stringify({ from: `Dima Ejel Portfolio <${from}>`, ...contactNotification(message, submittedAt) }),
    });
    if (!response.ok) {
      console.error(`Resend contact notification failed [${response.status}]: ${await response.text()}`);
      return false;
    }
    return z.object({ id: z.string().min(1) }).safeParse(await response.json()).success;
  } catch {
    console.error("Contact email service unavailable; submission remains saved");
    return false;
  }
}