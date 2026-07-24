import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminTextarea, AdminLabel } from "@/components/admin/PageHeader";
import { fetchEducation, qk, type Education } from "@/lib/cms";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/education")({
  component: EducationAdmin,
});

function EducationAdmin() {
  return (
    <CrudList<Education>
      title="Education"
      description="Degrees and academic history."
      table="education"
      queryKey={qk.educationAll}
      fetchAll={() => fetchEducation(true)}
      emptyLabel="No education entries yet."
      makeDefault={() => ({ institution: "", degree: "", period: "", courses: [], visible: true })}
      columns={[
        { header: "Institution", render: (r) => <div><div className="font-semibold">{r.institution}</div><div className="text-xs text-text-muted">{r.degree}</div></div> },
        { header: "Period", render: (r) => <span className="font-mono text-xs">{r.period}</span> },
        { header: "GPA", render: (r) => r.gpa ?? "—" },
      ]}
      renderForm={(v, onChange) => <Form v={v} onChange={onChange} />}
    />
  );
}

function Form({ v, onChange }: { v: Partial<Education>; onChange: (p: Partial<Education>) => void }) {
  const [courses, setCourses] = useState((v.courses ?? []).join(", "));
  const sync = (val: string) => {
    setCourses(val);
    onChange({ courses: val.split(",").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <div className="grid gap-3">
      <div><AdminLabel>Institution</AdminLabel><AdminInput value={v.institution ?? ""} onChange={(e) => onChange({ institution: e.target.value })} /></div>
      <div><AdminLabel>Degree</AdminLabel><AdminInput value={v.degree ?? ""} onChange={(e) => onChange({ degree: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><AdminLabel>Period</AdminLabel><AdminInput value={v.period ?? ""} onChange={(e) => onChange({ period: e.target.value })} /></div>
        <div><AdminLabel>GPA / Honors</AdminLabel><AdminInput value={v.gpa ?? ""} onChange={(e) => onChange({ gpa: e.target.value })} /></div>
      </div>
      <div><AdminLabel>Description</AdminLabel><AdminTextarea value={v.description ?? ""} onChange={(e) => onChange({ description: e.target.value })} /></div>
      <div><AdminLabel>Key courses (comma-separated)</AdminLabel><AdminInput value={courses} onChange={(e) => sync(e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
      </label>
    </div>
  );
}
