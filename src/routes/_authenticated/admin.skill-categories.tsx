import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchSkillCategories,
  fetchSkills,
  qk,
  type Skill,
  type SkillCategory,
} from "@/lib/cms";
import {
  AdminButton,
  AdminInput,
  AdminLabel,
  EmptyState,
  PageHeader,
} from "@/components/admin/PageHeader";
import { ActionButton, StatusBadge } from "@/components/admin/Actions";

export const Route = createFileRoute("/_authenticated/admin/skill-categories")({
  component: SkillCategoriesAdmin,
});

function SkillCategoriesAdmin() {
  const qc = useQueryClient();
  const catQ = useQuery({ queryKey: qk.skillCategoriesAll, queryFn: () => fetchSkillCategories(true) });
  const skillsQ = useQuery({ queryKey: qk.skillsAll, queryFn: () => fetchSkills(true) });

  const [editing, setEditing] = useState<Partial<SkillCategory> | null>(null);
  const [deleting, setDeleting] = useState<SkillCategory | null>(null);
  const [moveTo, setMoveTo] = useState<string>("");

  const categories = [...(catQ.data ?? [])].sort((a, b) => a.display_order - b.display_order);
  const skills: Skill[] = skillsQ.data ?? [];
  const countFor = (name: string) => skills.filter((s) => s.category === name).length;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.skillCategoriesAll });
    qc.invalidateQueries({ queryKey: qk.skillCategories });
    qc.invalidateQueries({ queryKey: qk.skillsAll });
    qc.invalidateQueries({ queryKey: qk.skills });
  };

  const save = useMutation({
    mutationFn: async (row: Partial<SkillCategory>) => {
      const name = (row.name ?? "").trim();
      if (!name) throw new Error("Category name is required.");
      if (row.id) {
        const previous = categories.find((c) => c.id === row.id);
        const { error } = await supabase
          .from("skill_categories")
          .update({ name, visible: row.visible ?? true })
          .eq("id", row.id);
        if (error) throw error;
        if (previous && previous.name !== name) {
          const { error: e2 } = await supabase
            .from("skills")
            .update({ category: name })
            .eq("category", previous.name);
          if (e2) throw e2;
        }
      } else {
        const nextOrder = categories.reduce((m, c) => Math.max(m, c.display_order), 0) + 10;
        const { error } = await supabase
          .from("skill_categories")
          .insert({ name, visible: row.visible ?? true, display_order: nextOrder });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved.");
      setEditing(null);
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<SkillCategory> }) => {
      const { error } = await supabase.from("skill_categories").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e) => toast.error((e as Error).message),
  });

  const remove = useMutation({
    mutationFn: async ({ category, target }: { category: SkillCategory; target: string }) => {
      if (target === "__delete__") {
        const { error } = await supabase.from("skills").delete().eq("category", category.name);
        if (error) throw error;
      } else if (target) {
        const { error } = await supabase
          .from("skills")
          .update({ category: target })
          .eq("category", category.name);
        if (error) throw error;
      }
      const { error } = await supabase.from("skill_categories").delete().eq("id", category.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted.");
      setDeleting(null);
      setMoveTo("");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const reorder = (row: SkillCategory, dir: -1 | 1) => {
    const idx = categories.findIndex((c) => c.id === row.id);
    const swap = categories[idx + dir];
    if (!swap) return;
    patch.mutate({ id: row.id, values: { display_order: swap.display_order } });
    patch.mutate({ id: swap.id, values: { display_order: row.display_order } });
  };

  return (
    <div>
      <PageHeader
        title="Skill Categories"
        description="Add, rename, reorder, hide or delete the groups used on the public Skills section."
        action={
          <AdminButton onClick={() => setEditing({ name: "", visible: true })}>
            <Plus className="h-4 w-4" /> New category
          </AdminButton>
        }
      />

      {catQ.isLoading && <div className="text-text-secondary">Loading…</div>}
      {!catQ.isLoading && categories.length === 0 && (
        <EmptyState>No categories yet. Create your first skill category.</EmptyState>
      )}

      {categories.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-elevated/60 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Skills</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{countFor(c.name)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={c.visible ? "success" : "muted"}>
                      {c.visible ? "Visible" : "Hidden"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <ActionButton
                        icon={<ChevronUp className="h-3.5 w-3.5" />}
                        label="Up"
                        tooltip="Move this category up"
                        onClick={() => reorder(c, -1)}
                        disabled={i === 0}
                        compact
                      />
                      <ActionButton
                        icon={<ChevronDown className="h-3.5 w-3.5" />}
                        label="Down"
                        tooltip="Move this category down"
                        onClick={() => reorder(c, 1)}
                        disabled={i === categories.length - 1}
                        compact
                      />
                      <ActionButton
                        icon={c.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        label={c.visible ? "Hide" : "Show"}
                        tooltip={
                          c.visible
                            ? "Hide this category from the public Skills section"
                            : "Show this category on the public Skills section"
                        }
                        onClick={() => patch.mutate({ id: c.id, values: { visible: !c.visible } })}
                      />
                      <ActionButton
                        icon={<Pencil className="h-3.5 w-3.5" />}
                        label="Edit"
                        tooltip="Rename this category"
                        tone="primary"
                        onClick={() => setEditing(c)}
                      />
                      <ActionButton
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        label="Delete"
                        tooltip="Delete this category"
                        tone="danger"
                        onClick={() => {
                          setDeleting(c);
                          setMoveTo("");
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? "Edit category" : "New category"} onClose={() => setEditing(null)}>
          <div className="space-y-3">
            <div>
              <AdminLabel>Category name</AdminLabel>
              <AdminInput
                value={editing.name ?? ""}
                placeholder="Mobile Development"
                onChange={(e) => setEditing((v) => ({ ...(v ?? {}), name: e.target.value }))}
              />
              {editing.id && (
                <p className="mt-1 text-xs text-text-muted">
                  Renaming also updates every skill currently in this category.
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={editing.visible ?? true}
                onChange={(e) => setEditing((v) => ({ ...(v ?? {}), visible: e.target.checked }))}
              />
              Show this category on the public Skills section
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </AdminButton>
            <AdminButton onClick={() => save.mutate(editing)} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </AdminButton>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal title={`Delete "${deleting.name}"?`} onClose={() => setDeleting(null)}>
          {countFor(deleting.name) === 0 ? (
            <p className="text-sm text-text-secondary">
              This category has no skills. It will be permanently removed.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                This category contains <strong>{countFor(deleting.name)}</strong> skill(s). Choose
                what should happen to them.
              </p>
              <div>
                <AdminLabel>What to do with the skills</AdminLabel>
                <select
                  value={moveTo}
                  onChange={(e) => setMoveTo(e.target.value)}
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select an option…</option>
                  {categories
                    .filter((c) => c.id !== deleting.id)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        Move skills to "{c.name}"
                      </option>
                    ))}
                  <option value="__delete__">Delete the category AND all of its skills</option>
                </select>
              </div>
              {moveTo === "__delete__" && (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  This permanently deletes {countFor(deleting.name)} skill(s). This cannot be undone.
                </p>
              )}
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
            <AdminButton variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              disabled={remove.isPending || (countFor(deleting.name) > 0 && !moveTo)}
              onClick={() => remove.mutate({ category: deleting, target: moveTo })}
            >
              {remove.isPending ? "Deleting…" : "Delete category"}
            </AdminButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 font-display text-lg font-bold text-foreground">{title}</h3>
        {children}
      </div>
    </div>
  );
}
