import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchMessages, qk, type ContactMessage } from "@/lib/cms";
import { useState } from "react";
import { PageHeader, EmptyState, AdminButton } from "@/components/admin/PageHeader";
import { Mail, MailOpen, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: qk.messages, queryFn: fetchMessages });
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const patch = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("contact_messages").update({ read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.messages }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      setSelected(null);
      qc.invalidateQueries({ queryKey: qk.messages });
    },
  });

  const messages = q.data ?? [];

  return (
    <div>
      <PageHeader title="Messages" description="Contact form submissions." />

      {q.isLoading && <div className="text-text-secondary">Loading…</div>}
      {!q.isLoading && messages.length === 0 && <EmptyState>Your inbox is empty.</EmptyState>}

      {messages.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden divide-y divide-border">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelected(m);
                if (!m.read) patch.mutate({ id: m.id, read: true });
              }}
              className="w-full text-left px-4 py-3 hover:bg-elevated/60 transition-colors flex items-start gap-3"
            >
              {m.read ? <MailOpen className="h-4 w-4 mt-1 text-text-muted" /> : <Mail className="h-4 w-4 mt-1 text-primary" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={"truncate " + (m.read ? "text-foreground" : "font-semibold text-foreground")}>
                    {m.name} — {m.subject}
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-text-secondary truncate mt-0.5">{m.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold text-foreground">{selected.subject}</h3>
                <div className="mt-1 text-sm text-text-secondary">
                  From <span className="text-foreground">{selected.name}</span> — <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                </div>
                <div className="text-xs text-text-muted mt-0.5">{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                >
                  Reply <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => patch.mutate({ id: selected.id, read: !selected.read })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                >
                  Mark {selected.read ? "unread" : "read"}
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-elevated p-4 whitespace-pre-wrap text-sm text-foreground max-h-[50vh] overflow-y-auto">
              {selected.message}
            </div>
            <div className="mt-4 flex justify-between">
              <AdminButton
                variant="danger"
                onClick={() => {
                  if (confirm("Delete this message?")) del.mutate(selected.id);
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setSelected(null)}>Close</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
