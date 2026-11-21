import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contactNotification } from "./contact-notification";

const input = { name: "Jane Doe", email: "jane@example.com", subject: "Web development opportunity", message: "Hello Dima,\nI'd like to discuss a project." };
const notification = contactNotification(input, "2026-11-21T12:30:00.000Z");

describe("contact notification", () => {
  it("always delivers to the requested owner address", () => {
    assert.deepEqual(notification.to, ["dimaejel79@gmail.com"]);
  });
  it("sets visitor email as Reply-To", () => {
    assert.equal(notification.reply_to, "jane@example.com");
  });
  it("includes sender subject in the requested notification subject", () => {
    assert.equal(notification.subject, "New Portfolio Contact Message – Web development opportunity");
  });
  it("includes all contact fields, complete multiline message and submission time", () => {
    for (const value of [...Object.values(input), "2026-11-21T12:30:00.000Z"]) {
      assert.ok(notification.text.includes(value));
    }
  });
});