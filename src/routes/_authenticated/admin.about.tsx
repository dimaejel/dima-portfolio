import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAboutSection, qk, type AboutSection } from "@/lib/cms";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageHeader, AdminInput, AdminTextarea, AdminLabel, AdminButton } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/about")({
  component: AboutAdmin,
});

type Form = AboutSection & { tagsText: string; skillsText: string; statsText: string };

function AboutAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.about, queryFn: fetchAboutSection });
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (q.data) {
      setForm({
        ...q.data,
        tagsText: (q.data.tags ?? []).join(", "),
        skillsText: (q.data.code_skills ?? []).join(", "),
        statsText: JSON.stringify(q.data.stats ?? [], null, 2),
      });
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      let stats: unknown;
      try {
        stats = JSON.parse(f.statsText);
        if (!Array.isArray(stats)) throw new Error("stats must be an array");
      } catch (e) {
        throw new Error("Stats JSON is invalid: " + (e as Error).message);
      }
      const payload = {
        eyebrow: f.eyebrow,
        heading: f.heading,
        heading_accent: f.heading_accent,
        description: f.description,
        tags: f.tagsText.split(",").map((s) => s.trim()).filter(Boolean),
        stats: stats as never,
        code_file_name: f.code_file_name,
        code_name: f.code_name,
        code_role: f.code_role,
        code_skills: f.skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        code_available: f.code_available,
        code_coffee: f.code_coffee,
      };
      const { error } = await supabase.from("about_section").update(payload).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("About section saved.");
      qc.invalidateQueries({ queryKey: qk.about });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (q.isLoading || !form) return <div className="text-text-secondary">Loading…</div>;

  const upd = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div>
      <PageHeader
        title="About Section"
        description="Content for the public About section — kept separate from the Home hero."
        action={
          <AdminButton onClick={() => save.mutate(form)} disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </AdminButton>
        }
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Eyebrow"><AdminInput value={form.eyebrow} onChange={(e) => upd("eyebrow", e.target.value)} /></Field>
        <Field label="Heading"><AdminInput value={form.heading} onChange={(e) => upd("heading", e.target.value)} /></Field>
        <Field label="Heading accent (gradient text)"><AdminInput value={form.heading_accent} onChange={(e) => upd("heading_accent", e.target.value)} /></Field>
        <Field label="Tags / hashtags (comma-separated)"><AdminInput value={form.tagsText} onChange={(e) => upd("tagsText", e.target.value)} /></Field>
        <Field label="About description (blank line = new paragraph)" wide>
          <AdminTextarea rows={10} value={form.description} onChange={(e) => upd("description", e.target.value)} />
        </Field>
        <Field label="Statistic cards (JSON array of {value, label})" wide>
          <AdminTextarea rows={6} value={form.statsText} onChange={(e) => upd("statsText", e.target.value)} className="font-mono text-xs" />
        </Field>

        <Field label="Code card — file name"><AdminInput value={form.code_file_name} onChange={(e) => upd("code_file_name", e.target.value)} /></Field>
        <Field label="Code card — properties" wide>
          <p className="text-sm text-text-secondary">
            The individual lines of the code card are managed on the <strong className="text-foreground">About Code Card</strong> page.
          </p>
        </Field>

      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <AdminLabel>{label}</AdminLabel>
      {children}
    </div>
  );
}
