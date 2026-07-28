import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCv } from "@/lib/download-cv";

/** Downloads the stored CV as a PDF file (never navigates to the storage URL). */
export function DownloadCvButton({
  resumeValue,
  className,
  label = "Download CV",
}: {
  resumeValue?: string | null;
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  if (!resumeValue) return null;

  const onClick = async () => {
    setBusy(true);
    try {
      await downloadCv(resumeValue);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={onClick} disabled={busy} className={className} aria-busy={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {busy ? "Preparing…" : label}
    </button>
  );
}
