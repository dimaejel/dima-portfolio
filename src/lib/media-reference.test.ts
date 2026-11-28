import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeMediaReference, normalizeRecordMedia } from "./media-reference";

describe("persistent portfolio files", () => {
  it("stores paths instead of expiring signed URLs", () => {
    assert.equal(normalizeMediaReference("https://files.example/storage/v1/object/sign/site-media/avatar/me%20photo.jpg?token=expired"), "avatar/me photo.jpg");
    assert.equal(normalizeMediaReference("/site-media/projects/photo.png"), "projects/photo.png");
  });
  it("rejects browser-only and local references", () => {
    for (const value of ["blob:https://example.test/id", "data:image/png;base64,abc", "file:///tmp/photo.png", "/tmp/photo.png", "../photo.png", "http://localhost:8080/photo.png"]) {
      assert.throws(() => normalizeMediaReference(value));
    }
  });
  it("preserves permanent external HTTPS documents", () => {
    assert.equal(normalizeMediaReference("https://issuer.example/certificate.pdf"), "https://issuer.example/certificate.pdf");
  });
  it("normalizes every project gallery and certificate reference", () => {
    assert.deepEqual(normalizeRecordMedia("projects", { image_url: "site-media/projects/a.png", gallery: ["/site-media/projects/b.png"] }), { image_url: "projects/a.png", gallery: ["projects/b.png"] });
    assert.deepEqual(normalizeRecordMedia("certifications", { image_url: "site-media/certifications/a.png", document_url: "site-media/certifications/a.pdf" }), { image_url: "certifications/a.png", document_url: "certifications/a.pdf" });
  });
});