import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tags } from "lucide-react";
import { toast } from "sonner";
import { CrudList } from "@/components/admin/CrudList";
import { CategoryCombobox } from "@/components/admin/CategoryCombobox";
import { AdminInput, AdminLabel } from "@/components/admin/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { fetchSkills, fetchSkillCategories, qk, type Skill } from "@/lib/cms";
import { slugForSkill, skillIconUrl } from "@/lib/skill-icons";

export const Route = createFileRoute("/_authenticated/admin/skills")({
  component: SkillsAdmin,
});

function SkillsAdmin() {
  const qc = useQueryClient();
  const categoriesQ = useQuery({
    queryKey: qk.skillCategoriesAll,
    queryFn: () => fetchSkillCategories(true),
  });
  const categories = (categoriesQ.data ?? []).map((c) => c.name);

  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      const nextOrder =
        (categoriesQ.data ?? []).reduce((m, c) => Math.max(m, c.display_order), 0) + 10;
      const { error } = await supabase
        .from("skill_categories")
        .insert({ name, display_order: nextOrder });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.skillCategoriesAll });
      qc.invalidateQueries({ queryKey: qk.skillCategories });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const onCategoryChange = (name: string) => {
    if (name && !categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      createCategory.mutate(name);
      toast.success(`Category "${name}" created.`);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/skill-categories"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Tags className="h-4 w-4" /> Manage Skill Categories
        </Link>
      </div>
    <CrudList<Skill>
      title="Skills"
      description="Technologies grouped by category."
      table="skills"
      queryKey={qk.skillsAll}
      fetchAll={() => fetchSkills(true)}
      emptyLabel="No skills yet."
      makeDefault={() => ({ name: "", category: categories[0] ?? "Languages", color: "#3B82F6", badge: "", icon_slug: "", visible: true })}
      columns={[
        {
          header: "Skill",
          render: (r) => (
            <div className="flex items-center gap-2">
              <SkillIcon name={r.name} slug={r.icon_slug} color={r.color} badge={r.badge} />
              {r.name}
            </div>
          ),
        },
        { header: "Category", render: (r) => <span className="font-mono text-xs">{r.category}</span> },
        {
          header: "Icon slug",
          render: (r) => (
            <span className="font-mono text-xs text-text-muted">
              {r.icon_slug || slugForSkill(r.name) || "—"}
            </span>
          ),
        },
      ]}
      renderForm={(v, onChange) => (
        <div className="grid gap-3">
          <div><AdminLabel>Name</AdminLabel><AdminInput value={v.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} /></div>
          <div>
            <AdminLabel>Category</AdminLabel>
            <CategoryCombobox
              value={v.category ?? ""}
              options={categories}
              onChange={(name) => {
                onCategoryChange(name);
                onChange({ category: name });
              }}
            />
            <p className="mt-1 text-xs text-text-muted">
              Pick an existing category or type a new one to create it.
            </p>
          </div>
          <div>
            <AdminLabel>Icon slug (Simple Icons)</AdminLabel>
            <div className="flex items-center gap-3">
              <AdminInput
                value={v.icon_slug ?? ""}
                placeholder={slugForSkill(v.name ?? "") ?? "e.g. react, nodedotjs, tailwindcss"}
                onChange={(e) => onChange({ icon_slug: e.target.value.trim().toLowerCase() })}
              />
              <SkillIcon name={v.name ?? ""} slug={v.icon_slug ?? ""} color={v.color ?? "#3B82F6"} badge={v.badge ?? ""} />
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Leave empty to auto-detect from the name. Browse slugs at simpleicons.org.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><AdminLabel>Badge fallback (initials)</AdminLabel><AdminInput value={v.badge ?? ""} onChange={(e) => onChange({ badge: e.target.value })} maxLength={4} /></div>
            <div><AdminLabel>Color (hex)</AdminLabel><AdminInput type="color" value={v.color ?? "#3B82F6"} onChange={(e) => onChange({ color: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.visible ?? true} onChange={(e) => onChange({ visible: e.target.checked })} /> Visible
          </label>
        </div>
      )}
    />
    </>
  );
}

function SkillIcon({
  name,
  slug,
  color,
  badge,
}: {
  name: string;
  slug?: string | null;
  color?: string | null;
  badge?: string | null;
}) {
  const resolved = slugForSkill(name, slug);
  if (resolved) {
    return (
      <img
        src={skillIconUrl(resolved)}
        alt=""
        className="h-6 w-6 shrink-0 object-contain"
        loading="lazy"
      />
    );
  }
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
      style={{ background: color ?? "#3B82F6" }}
    >
      {badge || name.slice(0, 2).toUpperCase()}
    </span>
  );
}
