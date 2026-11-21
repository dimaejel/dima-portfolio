import { describe, expect, test } from "bun:test";
import { contactSchema } from "./contact-schema";

const valid = { name: "Jane Doe", email: "jane@example.com", subject: "Portfolio inquiry", message: "Please contact me about this opportunity." };

describe("contact validation", () => {
  test("accepts all four valid contact fields", () => {
    expect(contactSchema.parse(valid)).toEqual(valid);
  });
  test("rejects malformed email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  test("requires every contact field", () => {
    for (const field of ["name", "email", "subject", "message"]) {
      expect(contactSchema.safeParse({ ...valid, [field]: "" }).success).toBe(false);
    }
  });
  test("rejects header injection", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "Hello\r\nBcc: attacker@example.com" }).success).toBe(false);
  });
  test("enforces bounded field lengths", () => {
    for (const [field, limit] of [["name", 100], ["email", 255], ["subject", 200], ["message", 5000]] as const) {
      expect(contactSchema.safeParse({ ...valid, [field]: "a".repeat(limit + 1) }).success).toBe(false);
    }
  });
  test("trims outer whitespace and preserves multiline message", () => {
    expect(contactSchema.parse({ ...valid, name: "  Jane Doe  ", message: "  Hello there\nPlease reply.  " }).message).toBe("Hello there\nPlease reply.");
  });
});