import { createFileRoute } from "@tanstack/react-router";
import { CrudList } from "@/components/admin/CrudList";
import { fetchCodeCard, qk, type CodeCardProp } from "@/lib/cms";
import { AdminInput, AdminLabel } from "@/components/admin/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/about-code-card")({
  component: CodeCardAdmin,
});

const TYPES = [
  { value: "string", label: 'Text / String — name: "Dima Ejel"' },
  { value: "boolean", label: "Boolean — available: true" },
  { value: "number", label: "Number — projects: 4" },
  { value: "array", label: 'Array / List — skills: ["Java", "React"]' },
  { value: "raw", label: "Custom / Raw code — coffee: Infinity" },
];

function preview(row: CodeCardProp) {
  const v = row.property_value;
  if (row.value_type === "array")
    return `[${v.split(",").map((s) => `"${s.trim()}"`).filter((s) => s !== '""').join(", ")}]`;
  if (row.value_type === "string") return `"${v}"`;
  return v;
}

function CodeCardAdmin() {
  return (
    <CrudList<CodeCardProp>
      title="About Code Card"
      description="Every line of the developer code card in the About section. Add, edit, reorder, hide or delete properties — the public card updates instantly."
      table="about_code_card"
      queryKey={qk.codeCardAll}
      fetchAll={() => fetchCodeCard(true)}
      emptyLabel="No properties yet. Add your first code card line."
      columns={[
        {
          header: "Property",
          render: (r) => <span className="font-mono text-sm">{r.property_name}</span>,
        },
        {
          header: "Value",
          render: (r) => (
            <span className="font-mono text-sm text-text-secondary break-all">{preview(r)}</span>
          ),
        },
        {
          header: "Type",
          render: (r) => <span className="text-xs uppercase text-text-muted">{r.value_type}</span>,
        },
      ]}
      makeDefault={() => ({
        property_name: "",
        property_value: "",
        value_type: "string",
        visible: true,
      })}
      renderForm={(value, onChange) => (
        <>
          <div>
            <AdminLabel>Property name</AdminLabel>
            <AdminInput
              value={value.property_name ?? ""}
              placeholder="university"
              onChange={(e) => onChange({ property_name: e.target.value })}
            />
          </div>
          <div>
            <AdminLabel>Value type</AdminLabel>
            <select
              value={value.value_type ?? "string"}
              onChange={(e) => onChange({ value_type: e.target.value })}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <AdminLabel>
              {value.value_type === "array"
                ? "Value (comma-separated list)"
                : value.value_type === "boolean"
                  ? "Value (true or false)"
                  : "Value"}
            </AdminLabel>
            <AdminInput
              value={value.property_value ?? ""}
              placeholder={
                value.value_type === "array"
                  ? "Java, React, Node.js"
                  : value.value_type === "boolean"
                    ? "true"
                    : value.value_type === "raw"
                      ? "Infinity"
                      : "Lebanese University"
              }
              onChange={(e) => onChange({ property_value: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={value.visible ?? true}
              onChange={(e) => onChange({ visible: e.target.checked })}
            />
            Show this line on the public code card
          </label>
        </>
      )}
    />
  );
}
