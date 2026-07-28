import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Megaphone,
  FileEdit,
  Star,
  StarOff,
} from "lucide-react";
import { PageHeader, AdminButton, EmptyState } from "./PageHeader";
import { ActionButton, ConfirmDialog, StatusBadge } from "./Actions";

export type CrudRow = {
  id: string;
  display_order?: number;
  visible?: boolean;
  published?: boolean;
  featured?: boolean;
};

type Column<T> = { header: string; render: (row: T) => ReactNode };


export function CrudList<T extends CrudRow>({
  title,
  description,
  table,
  queryKey,
  fetchAll,
  columns,
  emptyLabel,
  renderForm,
  makeDefault,
}: {
  title: string;
  description: string;
  table: string;
  queryKey: QueryKey;
  fetchAll: () => Promise<T[]>;
  columns: Column<T>[];
  emptyLabel: string;
  renderForm: (
    value: Partial<T>,
    onChange: (patch: Partial<T>) => void,
  ) => ReactNode;
  makeDefault: () => Partial<T>;
}) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey, queryFn: fetchAll });
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);


  const invalidate = () => {
    qc.invalidateQueries({ queryKey });
    qc.invalidateQueries({ queryKey: queryKey.slice(0, 1) });
  };

  const save = useMutation({
    mutationFn: async (row: Partial<T>) => {
      if (row.id) {
        const { id, ...rest } = row;
        const { error } = await supabase.from(table as never).update(rest as never).eq("id", id);
        if (error) throw error;
      } else {
        const nextOrder = (q.data ?? []).reduce((m, r) => Math.max(m, r.display_order ?? 0), 0) + 10;
        const { error } = await supabase
          .from(table as never)
          .insert({ ...(row as object), display_order: row.display_order ?? nextOrder } as never);
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

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      invalidate();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<T> }) => {
      const { error } = await supabase.from(table as never).update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
    onError: (e) => toast.error((e as Error).message),
  });

  const reorder = (row: T, dir: -1 | 1) => {
    const sorted = [...(q.data ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const idx = sorted.findIndex((r) => r.id === row.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    patch.mutate({ id: row.id, values: { display_order: swap.display_order } as Partial<T> });
    patch.mutate({ id: swap.id, values: { display_order: row.display_order } as Partial<T> });
  };

  const rows = [...(q.data ?? [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <AdminButton onClick={() => setEditing(makeDefault())}>
            <Plus className="h-4 w-4" /> New
          </AdminButton>
        }
      />

      {q.isLoading && <div className="text-text-secondary">Loading…</div>}
      {!q.isLoading && rows.length === 0 && <EmptyState>{emptyLabel}</EmptyState>}

      {rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-elevated/60 text-text-muted text-xs uppercase tracking-wider">
              <tr>
                {columns.map((c) => (
                  <th key={c.header} className="text-left px-4 py-3 font-medium">{c.header}</th>
                ))}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-border">
                  {columns.map((c) => (
                    <td key={c.header} className="px-4 py-3 align-top text-foreground">{c.render(row)}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="Move up" onClick={() => reorder(row, -1)} disabled={i === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn title="Move down" onClick={() => reorder(row, 1)} disabled={i === rows.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </IconBtn>
                      {typeof row.visible === "boolean" && (
                        <IconBtn
                          title={row.visible ? "Hide" : "Show"}
                          onClick={() => patch.mutate({ id: row.id, values: { visible: !row.visible } as Partial<T> })}
                        >
                          {row.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-text-muted" />}
                        </IconBtn>
                      )}
                      <IconBtn title="Edit" onClick={() => setEditing(row)}>
                        <Pencil className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        title="Delete"
                        onClick={() => {
                          if (confirm("Delete this item?")) del.mutate(row.id);
                        }}
                        danger
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? "Edit" : "New"}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {renderForm(editing, (patch) => setEditing((e) => ({ ...(e ?? {}), ...patch })))}
          </div>
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-border">
            <AdminButton variant="ghost" onClick={() => setEditing(null)}>Cancel</AdminButton>
            <AdminButton onClick={() => save.mutate(editing)} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </AdminButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

function IconBtn({
  children,
  danger,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center h-8 w-8 rounded-md border border-transparent transition-colors " +
        (danger ? "text-red-400 hover:bg-red-500/10" : "text-text-secondary hover:bg-elevated hover:text-foreground") +
        " disabled:opacity-30 disabled:cursor-not-allowed"
      }
    />
  );
}

function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-bold text-foreground mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
