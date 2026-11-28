const storagePrefix = /\/storage\/v1\/object\/(?:public|sign|authenticated)\/site-media\//;

/** Persist an object path, never an expiring signed URL or browser-local value. */
export function normalizeMediaReference(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^(blob:|data:|file:|[a-z]:\\)/i.test(trimmed)) {
    throw new Error("Choose a file to upload; temporary or local file references cannot be saved.");
  }
  const match = storagePrefix.exec(trimmed);
  if (match) {
    const path = trimmed.slice(match.index + match[0].length).split("?")[0] ?? "";
    return normalizeMediaReference(decodeURIComponent(path));
  }
  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(url.hostname)) {
      throw new Error("Use a permanent HTTPS file URL or upload the file.");
    }
    return trimmed;
  }
  const path = trimmed.replace(/^\/+/, "").replace(/^site-media\//, "");
  if (!path || path.split("/").some((part) => part === "..") || /^(tmp|mnt|dev-server|src|public)\//.test(path)) {
    throw new Error("Use a portfolio storage path or upload the file.");
  }
  return path;
}

export function normalizeRecordMedia(table: string, row: Record<string, unknown>) {
  const fields = table === "projects" ? ["image_url"] : table === "certifications" ? ["image_url", "document_url", "link"] : [];
  const next = { ...row };
  for (const field of fields) {
    const value = next[field];
    if (typeof value === "string" || value === null) next[field] = normalizeMediaReference(value);
  }
  if (table === "projects" && Array.isArray(next["gallery"])) {
    next["gallery"] = next["gallery"].map((value: unknown) => {
      if (typeof value !== "string") throw new Error("Invalid gallery file reference.");
      return normalizeMediaReference(value);
    }).filter(Boolean);
  }
  return next;
}