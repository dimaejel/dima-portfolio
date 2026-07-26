import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Github, CalendarDays, UserRound } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { fetchProject } from "@/lib/cms";
import { categoryIcon } from "@/lib/icon-map";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project Details — Dima Ejel" },
      { name: "description", content: "Detailed case study of a software project by Dima Ejel — stack, role, features, challenges and outcomes." },
      { property: "og:title", content: "Project Details — Dima Ejel" },
      { property: "og:description", content: "Detailed case study of a software project by Dima Ejel." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Project Details — Dima Ejel" },
      { name: "twitter:description", content: "Detailed case study of a software project by Dima Ejel." },
    ],
  }),
  component: ProjectDetail,
  errorComponent: ({ error }) => (
    <Shell>
      <p className="text-text-secondary" role="alert">{(error as Error).message}</p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <p className="text-text-secondary">Project not found.</p>
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <main id="main" className="mx-auto max-w-4xl px-5 pt-28 pb-24">
        <Link
          to="/"
          hash="projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <div className="mt-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 text-text-secondary leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

function ProjectDetail() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => fetchProject(id),
  });

  if (isLoading) return <Shell><p className="text-text-secondary">Loading…</p></Shell>;
  if (!p) return <Shell><p className="text-text-secondary">Project not found.</p></Shell>;

  const Icon = categoryIcon(p.category);

  return (
    <Shell>
      <div className={`relative h-64 rounded-2xl overflow-hidden border border-border bg-gradient-to-br ${p.gradient || "from-blue-500 to-violet-600"} flex items-center justify-center`}>
        <div className="absolute inset-0 dot-grid opacity-20" />
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Icon className="h-20 w-20 text-white/90" strokeWidth={1.2} />
        )}
      </div>

      <span className="mt-8 block font-mono text-xs uppercase tracking-[0.2em] text-primary">{p.category}</span>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mt-2">{p.title}</h1>
      <p className="text-text-secondary mt-4 leading-relaxed">{p.description}</p>

      <div className="flex flex-wrap gap-4 mt-6 text-sm text-text-secondary">
        {p.role && <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-primary" /> {p.role}</span>}
        {p.duration && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {p.duration}</span>}
      </div>

      {p.tech_stack?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {p.tech_stack.map((t) => (
            <span key={t} className="rounded-full border border-border bg-elevated px-2.5 py-1 text-[11px] font-mono text-text-secondary">{t}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-8">
        {p.demo_url && (
          <a href={p.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(124,58,237,0.6)]">
            <ExternalLink className="h-4 w-4" /> Live Demo
          </a>
        )}
        {p.github_url && (
          <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <Github className="h-4 w-4" /> Source Code
          </a>
        )}
      </div>

      {p.full_description && <Block title="Overview">{p.full_description}</Block>}

      {p.features?.length > 0 && (
        <Block title="Key Features">
          <ul className="list-disc pl-5 space-y-1">
            {p.features.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </Block>
      )}

      {p.challenges && <Block title="Challenges">{p.challenges}</Block>}
      {p.solutions && <Block title="Solutions">{p.solutions}</Block>}
      {p.results && <Block title="Results & Outcomes">{p.results}</Block>}

      {p.gallery?.length > 0 && (
        <Block title="Gallery">
          <div className="grid sm:grid-cols-2 gap-4">
            {p.gallery.map((src) => (
              <img key={src} src={src} alt={`${p.title} screenshot`} loading="lazy" className="rounded-xl border border-border object-cover w-full h-48" />
            ))}
          </div>
        </Block>
      )}
    </Shell>
  );
}
