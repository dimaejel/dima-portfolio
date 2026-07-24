import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminLabel } from "@/components/admin/PageHeader";
import { fetchSkills, qk, type Skill } from "@/lib/cms";

export const Route = createFileRoute("/_authenticated/admin/skills")({
  component: SkillsAdmin,
});

function SkillsAdmin() {
  return (
    <CrudList<Skill>
      title="Skills"
      description="Technologies grouped by category."
      table="skills"
      queryKey={qk.skillsAll}
      fetchAll={() => fetchSkills(true)}
      emptyLabel="No skills yet."
      makeDefault={() => ({ name: "", category: "Languages", color: "#3B82F6", badge: "", visible: true })}
      columns={[
        {
          header: "Skill",
          render: (r) => (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: r.color }}>{r.badge}</span>
              {r.name}
            </div>
          ),
        },
        { header: "Category", render: (r) => <span className="font-mono text-xs">{r.category}</span> },
      ]}
      renderForm={(v, onChange) => (
        <div className="grid gap-3">
          <div><AdminLabel>Name</AdminLabel><AdminInput value={v.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} /></div>
          <div>
            <AdminLabel>Category</AdminLabel>
            <select
              value={v.category ?? "Languages"}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full rounded-lg bg-elevated border border-border text-foreground px-3 py-2 text-sm"
            >
              <option>Languages</option>
              <option>Frontend</option>
              <option>Backend</option>
              <option>Tools &amp; Cloud</option>
              <option>Databases</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><AdminLabel>Badge (initials)</AdminLabel><AdminInput value={v.badge ?? ""} onChange={(e) => onChange({ badge: e.target.value })} maxLength={4} /></div>
            <div><AdminLabel>Color (hex)</AdminLabel><AdminInput type="color" value={v.color ?? "#3B82F6"} onChange={(e) => onChange({ color: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
          </label>
        </div>
      )}
    />
  );
}
