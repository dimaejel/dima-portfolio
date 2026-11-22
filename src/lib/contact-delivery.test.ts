import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deliverContactNotification } from "./contact-delivery";

const message = { name: "Jane Doe", email: "jane@example.com", subject: "Opportunity", message: "Hello Dima, please contact me about a project." };
const config = { apiKey: "test-connection-key", gatewayKey: "test-gateway-key" };

describe("owner-only Resend delivery", () => {
  it("uses the permitted test sender and fixed Gmail recipient without a domain", async () => {
    const accepted = await deliverContactNotification(message, "2026-11-22T08:20:00.000Z", "submission-1", config, async (url, init) => {
      assert.equal(url, "https://connector-gateway.lovable.dev/resend/emails");
      assert.equal(init?.method, "POST");
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      assert.equal(body["from"], "Dima Ejel Portfolio <onboarding@resend.dev>");
      assert.deepEqual(body["to"], ["dimaejel79@gmail.com"]);
      assert.equal(body["reply_to"], "jane@example.com");
      assert.equal(new Headers(init?.headers).get("Idempotency-Key"), "contact-submission-1");
      return Response.json({ id: "resend-message-1" });
    });
    assert.equal(accepted, true);
  });
  it("keeps notification failure non-throwing so saved submissions remain successful", async () => {
    assert.equal(await deliverContactNotification(message, "2026-11-22", "submission-2", config, async () => {
      throw new Error("Network unavailable");
    }), false);
    assert.equal(await deliverContactNotification(message, "2026-11-22", "submission-3", config, async () => new Response("Service unavailable", { status: 503 })), false);
  });
  it("does not report acceptance without a provider message id", async () => {
    assert.equal(await deliverContactNotification(message, "2026-11-22", "submission-4", config, async () => Response.json({ error: "Rejected" })), false);
  });
  it("missing credentials do not make an external request", async () => {
    let called = false;
    assert.equal(await deliverContactNotification(message, "2026-11-22", "submission-5", {}, async () => {
      called = true;
      return Response.json({ id: "unexpected" });
    }), false);
    assert.equal(called, false);
  });
});