import type { ContactInput } from "./contact-schema";

export function contactNotification(message: ContactInput, submittedAt: string) {
  return {
    to: ["dimaejel79@gmail.com"],
    reply_to: message.email,
    subject: `New Portfolio Contact Message – ${message.subject}`,
    text: [
      "Dima Ejel — Portfolio Contact",
      "",
      `Full Name: ${message.name}`,
      `Email Address: ${message.email}`,
      `Subject: ${message.subject}`,
      `Submission Date and Time: ${submittedAt} (UTC)`,
      "",
      "Message:",
      message.message,
    ].join("\n"),
  };
}