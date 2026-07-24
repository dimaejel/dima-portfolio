import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminTextarea, AdminLabel } from "@/components/admin/PageHeader";
import { fetchExperience, qk, type Experience } from "@/lib/cms";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/experience")({
  component: ExperienceAdmin,
});

function ExperienceAdmin() {
  return (
    <CrudList<Experience>
      title="Experience"
      description="Roles displayed on the timeline."
      table="experience"
      queryKey={qk.experienceAll}
      fetchAll={() => fetchExperience(true)}
      emptyLabel="No experience entries yet."
      makeDefault={() => ({ role: "", company: "", period: "", type: "work", bullets: [], is_current: false, visible: true })}
      columns={[
        { header: "Role", render: (r) => <div><div className="font-semibold">{r.role}</div><div className="text-xs text-text-muted">{r.company}</div></div> },
        { header: "Period", render: (r) => <span className="font-mono text-xs">{r.period}</span> },
        { header: "Type", render: (r) => r.type },
      ]}
      renderForm={(v, onChange) => <Form v={v} onChange={onChange} />}
    />
  );
}

function Form({ v, onChange }: { v: Partial<Experience>; onChange: (p: Partial<Experience>) => void }) {
  const [bullets, setBullets] = useState((v.bullets ?? []).join("\n"));
  const sync = (val: string) => {
    setBullets(val);
    onChange({ bullets: val.split("\n").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div><AdminLabel>Role</AdminLabel><AdminInput value={v.role ?? ""} onChange={(e) => onChange({ role: e.target.value })} /></div>
        <div><AdminLabel>Company</AdminLabel><AdminInput value={v.company ?? ""} onChange={(e) => onChange({ company: e.target.value })} /></div>
        <div><AdminLabel>Period</AdminLabel><AdminInput value={v.period ?? ""} onChange={(e) => onChange({ period: e.target.value })} placeholder="Jan 2024 — Present" /></div>
        <div>
          <AdminLabel>Type</AdminLabel>
          <select
            value={v.type ?? "work"}
            onChange={(e) => onChange({ type: e.target.value })}
            className="w-full rounded-lg bg-elevated border border-border text-foreground px-3 py-2 text-sm"
          >
            <option value="work">Work</option>
            <option value="internship">Internship</option>
            <option value="freelance">Freelance</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>
      </div>
      <div><AdminLabel>Bullets (one per line)</AdminLabel><AdminTextarea rows={5} value={bullets} onChange={(e) => sync(e.target.value)} /></div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!v.is_current} onChange={(e) => onChange({ is_current: e.target.checked })} /> Current role
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
        </label>
      </div>
    </div>
  );
}
