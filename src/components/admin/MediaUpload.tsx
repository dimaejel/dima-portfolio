import { createContext, useContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadRecordMedia } from "@/lib/cms";
import { AdminButton } from "./PageHeader";

export const MediaUploadActivity = createContext<(delta: number) => void>(() => {});

export function MediaUpload({ folder, table, recordId, field, accept = "image/*", label = "Upload", onSaved }: {
  folder: string;
  table: "projects" | "certifications";
  recordId?: string | undefined;
  field: "image_url" | "document_url" | "gallery";
  accept?: string;
  label?: string;
  onSaved: (value: string | string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const activity = useContext(MediaUploadActivity);
  const qc = useQueryClient();
  const upload = async (file: File) => {
    setBusy(true);
    activity(1);
    try {
      const value = await uploadRecordMedia(file, folder, recordId ? { table, id: recordId, field } : undefined);
      onSaved(value);
      if (recordId) {
        await qc.invalidateQueries({ queryKey: [table] });
        toast.success("File uploaded and saved.");
      } else {
        toast.info("File uploaded. Save this new item to publish it.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "File could not be saved.");
    } finally {
      activity(-1);
      setBusy(false);
    }
  };
  return (
    <label className="inline-flex">
      <AdminButton variant="ghost" type="button" disabled={busy} onClick={(e) => e.currentTarget.parentElement?.querySelector("input")?.click()}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{busy ? "Saving…" : label}
      </AdminButton>
      <input type="file" aria-label={label} accept={accept} disabled={busy} className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file) void upload(file);
      }} />
    </label>
  );
}