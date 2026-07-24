import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminTextarea, AdminLabel } from "@/components/admin/PageHeader";
import { fetchProjects, qk, uploadMedia, type Project } from "@/lib/cms";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  return (
    <CrudList<Project>
      title="Projects"
      description="Portfolio projects shown on the site."
      table="projects"
      queryKey={qk.projectsAll}
      fetchAll={() => fetchProjects(true)}
      emptyLabel="No projects yet — click New to add one."
      makeDefault={() => ({
        title: "",
        description: "",
        category: "web",
        tech_stack: [],
        visible: true,
        featured: false,
      })}
      columns={[
        { header: "Title", render: (r) => <div className="font-semibold">{r.title}</div> },
        { header: "Category", render: (r) => <span className="font-mono text-xs">{r.category}</span> },
        {
          header: "Tech",
          render: (r) => (
            <div className="flex flex-wrap gap-1">
              {r.tech_stack.slice(0, 4).map((t) => (
                <span key={t} className="rounded-md bg-elevated px-1.5 py-0.5 text-[11px]">{t}</span>
              ))}
              {r.tech_stack.length > 4 && <span className="text-xs text-text-muted">+{r.tech_stack.length - 4}</span>}
            </div>
          ),
        },
        { header: "Featured", render: (r) => (r.featured ? "★" : "—") },
      ]}
      renderForm={(v, onChange) => <ProjectForm v={v} onChange={onChange} />}
    />
  );
}

function ProjectForm({ v, onChange }: { v: Partial<Project>; onChange: (p: Partial<Project>) => void }) {
  const [techText, setTechText] = useState((v.tech_stack ?? []).join(", "));
  const setTech = (val: string) => {
    setTechText(val);
    onChange({ tech_stack: val.split(",").map((s) => s.trim()).filter(Boolean) });
  };

  const upload = async (file: File) => {
    try {
      const url = await uploadMedia(file, "projects");
      onChange({ image_url: url });
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="grid gap-3">
      <div><AdminLabel>Title</AdminLabel><AdminInput value={v.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} /></div>
      <div><AdminLabel>Description</AdminLabel><AdminTextarea value={v.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <AdminLabel>Category</AdminLabel>
          <select
            value={v.category ?? "web"}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full rounded-lg bg-elevated border border-border text-foreground px-3 py-2 text-sm"
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="systems">Systems</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <AdminLabel>Gradient (CSS classes)</AdminLabel>
          <AdminInput value={v.gradient ?? ""} onChange={(e) => onChange({ gradient: e.target.value })} placeholder="from-blue-500 to-violet-500" />
        </div>
      </div>
      <div><AdminLabel>Tech stack (comma-separated)</AdminLabel><AdminInput value={techText} onChange={(e) => setTech(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><AdminLabel>Demo URL</AdminLabel><AdminInput value={v.demo_url ?? ""} onChange={(e) => onChange({ demo_url: e.target.value })} /></div>
        <div><AdminLabel>GitHub URL</AdminLabel><AdminInput value={v.github_url ?? ""} onChange={(e) => onChange({ github_url: e.target.value })} /></div>
      </div>
      <div>
        <AdminLabel>Image</AdminLabel>
        <div className="flex flex-wrap items-center gap-3">
          {v.image_url && <img src={v.image_url} alt="" className="h-14 w-24 rounded object-cover border border-border" />}
          <AdminInput value={v.image_url ?? ""} onChange={(e) => onChange({ image_url: e.target.value })} placeholder="https://…" />
          <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:border-primary/40">
            <Upload className="h-4 w-4" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          </label>
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!v.featured} onChange={(e) => onChange({ featured: e.target.checked })} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
        </label>
      </div>
    </div>
  );
}
