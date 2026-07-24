import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { AdminInput, AdminTextarea, AdminLabel } from "@/components/admin/PageHeader";
import { fetchAchievements, qk, type Achievement } from "@/lib/cms";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/achievements")({
  component: AchievementsAdmin,
});

function AchievementsAdmin() {
  return (
    <CrudList<Achievement>
      title="Achievements"
      description="Awards, honors, and community wins."
      table="achievements"
      queryKey={qk.achievementsAll}
      fetchAll={() => fetchAchievements(true)}
      emptyLabel="No achievements yet."
      makeDefault={() => ({ category: "", icon: "Trophy", items: [], visible: true })}
      columns={[
        { header: "Category", render: (r) => <div className="font-semibold">{r.category}</div> },
        { header: "Icon", render: (r) => <span className="font-mono text-xs">{r.icon}</span> },
        { header: "Items", render: (r) => <span className="text-xs text-text-muted">{r.items.length}</span> },
      ]}
      renderForm={(v, onChange) => <Form v={v} onChange={onChange} />}
    />
  );
}

function Form({ v, onChange }: { v: Partial<Achievement>; onChange: (p: Partial<Achievement>) => void }) {
  const [items, setItems] = useState((v.items ?? []).join("\n"));
  const sync = (val: string) => {
    setItems(val);
    onChange({ items: val.split("\n").map((s) => s.trim()).filter(Boolean) });
  };
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div><AdminLabel>Category</AdminLabel><AdminInput value={v.category ?? ""} onChange={(e) => onChange({ category: e.target.value })} /></div>
        <div><AdminLabel>Icon (lucide name)</AdminLabel><AdminInput value={v.icon ?? "Trophy"} onChange={(e) => onChange({ icon: e.target.value })} placeholder="Trophy" /></div>
      </div>
      <div><AdminLabel>Items (one per line)</AdminLabel><AdminTextarea rows={5} value={items} onChange={(e) => sync(e.target.value)} /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
      </label>
    </div>
  );
}
