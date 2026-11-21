import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "./contact-schema";

const valid = { name: "Jane Doe", email: "jane@example.com", subject: "Portfolio inquiry", message: "Please contact me about this opportunity." };

describe("contact validation", () => {
  test("accepts all four valid contact fields", () => {
    assert.deepEqual(contactSchema.parse(valid), valid);
  });
  test("rejects malformed email", () => {
    assert.equal(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
  });
  test("requires every contact field", () => {
    for (const field of ["name", "email", "subject", "message"]) {
      assert.equal(contactSchema.safeParse({ ...valid, [field]: "" }).success, false);
    }
  });
  test("rejects header injection", () => {
    assert.equal(contactSchema.safeParse({ ...valid, subject: "Hello\r\nBcc: attacker@example.com" }).success, false);
  });
  test("enforces bounded field lengths", () => {
    for (const [field, limit] of [["name", 100], ["email", 255], ["subject", 200], ["message", 5000]] as const) {
      assert.equal(contactSchema.safeParse({ ...valid, [field]: "a".repeat(limit + 1) }).success, false);
    }
  });
  test("trims outer whitespace and preserves multiline message", () => {
    assert.equal(contactSchema.parse({ ...valid, name: "  Jane Doe  ", message: "  Hello there\nPlease reply.  " }).message, "Hello there\nPlease reply.");
  });
});