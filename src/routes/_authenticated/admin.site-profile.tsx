import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteProfile, qk, uploadMedia, type SiteProfile } from "@/lib/cms";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { PageHeader, AdminInput, AdminTextarea, AdminLabel, AdminButton } from "@/components/admin/PageHeader";
import { MediaImage, useMediaUrl } from "@/components/MediaImage";


export const Route = createFileRoute("/_authenticated/admin/site-profile")({
  component: SiteProfilePage,
});

type Form = SiteProfile & { rolesText: string; interestsText: string; statsText: string };

function SiteProfilePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.siteProfile, queryFn: fetchSiteProfile });
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (q.data) {
      setForm({
        ...q.data,
        rolesText: (q.data.roles ?? []).join(", "),
        interestsText: (q.data.interests ?? []).join(", "),
        statsText: JSON.stringify(q.data.stats ?? [], null, 2),
      });
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      let stats;
      try {
        stats = JSON.parse(f.statsText);
        if (!Array.isArray(stats)) throw new Error("stats must be an array");
      } catch (e) {
        throw new Error("Stats JSON is invalid: " + (e as Error).message);
      }
      const payload = {
        name: f.name,
        initials: f.initials,
        title: f.title,
        roles: f.rolesText.split(",").map((s) => s.trim()).filter(Boolean),
        bio: f.bio,
        email: f.email,
        phone: f.phone,
        location: f.location,
        avatar_url: f.avatar_url,
        resume_url: f.resume_url,
        github_url: f.github_url,
        linkedin_url: f.linkedin_url,
        github_handle: f.github_handle,
        linkedin_handle: f.linkedin_handle,
        availability_status: f.availability_status,
        stats,
        interests: f.interestsText.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { error } = await supabase.from("site_profile").update(payload).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: qk.siteProfile });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const upload = async (kind: "avatar" | "resume", file: File) => {
    try {
      const url = await uploadMedia(file, kind);
      setForm((f) => (f ? { ...f, [kind === "avatar" ? "avatar_url" : "resume_url"]: url } : f));
      toast.success("Uploaded.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (q.isLoading || !form) return <div className="text-text-secondary">Loading…</div>;

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <PageHeader
        title="Site Profile"
        description="Edit your hero, about, and contact details."
        action={
          <AdminButton onClick={() => save.mutate(form)} disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </AdminButton>
        }
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name"><AdminInput value={form.name} onChange={(e) => upd("name", e.target.value)} /></Field>
        <Field label="Initials"><AdminInput value={form.initials} onChange={(e) => upd("initials", e.target.value)} /></Field>
        <Field label="Title"><AdminInput value={form.title} onChange={(e) => upd("title", e.target.value)} /></Field>
        <Field label="Availability status"><AdminInput value={form.availability_status} onChange={(e) => upd("availability_status", e.target.value)} /></Field>
        <Field label="Roles (comma-separated, used by hero typewriter)" wide>
          <AdminInput value={form.rolesText} onChange={(e) => upd("rolesText", e.target.value)} />
        </Field>
        <Field label="Bio" wide><AdminTextarea rows={4} value={form.bio} onChange={(e) => upd("bio", e.target.value)} /></Field>

        <Field label="Email"><AdminInput type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} /></Field>
        <Field label="Phone"><AdminInput value={form.phone ?? ""} onChange={(e) => upd("phone", e.target.value)} /></Field>
        <Field label="Location"><AdminInput value={form.location} onChange={(e) => upd("location", e.target.value)} /></Field>

        <Field label="GitHub URL"><AdminInput value={form.github_url ?? ""} onChange={(e) => upd("github_url", e.target.value)} /></Field>
        <Field label="LinkedIn URL"><AdminInput value={form.linkedin_url ?? ""} onChange={(e) => upd("linkedin_url", e.target.value)} /></Field>
        <Field label="GitHub handle (display)"><AdminInput value={form.github_handle ?? ""} onChange={(e) => upd("github_handle", e.target.value)} /></Field>
        <Field label="LinkedIn handle (display)"><AdminInput value={form.linkedin_handle ?? ""} onChange={(e) => upd("linkedin_handle", e.target.value)} /></Field>

        <Field label="Interests (comma-separated)" wide>
          <AdminInput value={form.interestsText} onChange={(e) => upd("interestsText", e.target.value)} />
        </Field>

        <Field label="Stats (JSON array of {label, value})" wide>
          <AdminTextarea rows={5} value={form.statsText} onChange={(e) => upd("statsText", e.target.value)} className="font-mono text-xs" />
        </Field>

        <Field label="Avatar" wide>
          <div className="flex flex-wrap items-center gap-3">
            <MediaImage path={form.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover border border-border" />
            <AdminInput value={form.avatar_url ?? ""} onChange={(e) => upd("avatar_url", e.target.value)} placeholder="avatar/…" />
            <FileButton onFile={(f) => upload("avatar", f)} />
          </div>
        </Field>

        <Field label="Resume / CV" wide>
          <div className="flex flex-wrap items-center gap-3">
            <AdminInput value={form.resume_url ?? ""} onChange={(e) => upd("resume_url", e.target.value)} placeholder="resume/…" />
            <FileButton onFile={(f) => upload("resume", f)} accept=".pdf,.doc,.docx" />
            <ResumePreview path={form.resume_url} />
          </div>
        </Field>

      </div>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <AdminLabel>{label}</AdminLabel>
      {children}
    </div>
  );
}

function FileButton({ onFile, accept = "image/*" }: { onFile: (f: File) => void; accept?: string }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:border-primary/40">
      <Upload className="h-4 w-4" /> Upload
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
