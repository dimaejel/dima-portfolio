import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { qk } from "@/lib/cms";
import {
  FolderKanban, Sparkles, Briefcase, GraduationCap, Award, Mail, MailOpen,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

const countFrom = async (table: string, filter?: (q: ReturnType<typeof supabase.from>) => unknown) => {
  const base = supabase.from(table as never).select("*", { count: "exact", head: true });
  const q = filter ? (filter(base) as typeof base) : base;
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
};

function Overview() {
  const q = useQuery({
    queryKey: qk.stats,
    queryFn: async () => {
      const [projects, featured, skills, experience, education, certifications, messages, unread] =
        await Promise.all([
          countFrom("projects"),
          countFrom("projects", (b) => b.eq("featured", true)),
          countFrom("skills"),
          countFrom("experience"),
          countFrom("education"),
          countFrom("certifications"),
          countFrom("contact_messages"),
          countFrom("contact_messages", (b) => b.eq("read", false)),
        ]);
      return { projects, featured, skills, experience, education, certifications, messages, unread };
    },
  });

  const cards = [
    { label: "Projects", value: q.data?.projects, sub: `${q.data?.featured ?? 0} featured`, icon: FolderKanban },
    { label: "Skills", value: q.data?.skills, icon: Sparkles },
    { label: "Experience", value: q.data?.experience, icon: Briefcase },
    { label: "Education", value: q.data?.education, icon: GraduationCap },
    { label: "Certifications", value: q.data?.certifications, icon: Award },
    { label: "Messages", value: q.data?.messages, sub: `${q.data?.unread ?? 0} unread`, icon: q.data?.unread ? Mail : MailOpen },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">Overview</h2>
      <p className="mt-1 text-sm text-text-secondary">A snapshot of your portfolio content.</p>

      {q.isError && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          Failed to load stats: {(q.error as Error).message}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 font-display text-3xl font-extrabold text-foreground">
              {q.isLoading ? "—" : c.value ?? 0}
            </div>
            {c.sub && <div className="mt-1 text-xs text-text-muted">{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
