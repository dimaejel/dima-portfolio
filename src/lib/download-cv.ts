import { resolveMediaUrl } from "@/lib/cms";

/**
 * Downloads the CV as a real file instead of navigating to the storage URL.
 * Always resolves a fresh signed URL first, so expired links never leak through.
 */
export async function downloadCv(storedValue: string | null | undefined, filename = "Dima-Ejel-CV.pdf") {
  if (!storedValue) throw new Error("No CV has been uploaded yet.");

  const url = await resolveMediaUrl(storedValue);
  if (!url) throw new Error("The CV link could not be generated. Please try again.");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("The CV could not be downloaded. Please try again.");

  const raw = await res.blob();
  const blob = raw.type === "application/pdf" ? raw : new Blob([raw], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
