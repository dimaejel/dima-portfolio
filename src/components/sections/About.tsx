import { personalInfo } from "@/data/portfolio";
import { useAboutSection, useCodeCard } from "@/hooks/use-portfolio";
import { Reveal, Section, SectionEyebrow } from "./_shared";

type AboutStat = { value: string; label: string };

/** Renders a code-card value with syntax colours appropriate to its type. */
function CodeValue({ type, value }: { type: string; value: string }) {
  if (type === "boolean")
    return <span className="text-[#569cd6]">{value === "true" ? "true" : "false"}</span>;
  if (type === "number") return <span className="text-[#b5cea8]">{value}</span>;
  if (type === "raw") return <span className="text-[#4fc1ff]">{value}</span>;
  if (type === "array") {
    const items = value.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <>
        <span className="text-foreground">[</span>
        {items.map((s, i) => (
          <span key={s + i}>
            <span className="text-[#ce9178]">"{s}"</span>
            {i < items.length - 1 && <span className="text-foreground">, </span>}
          </span>
        ))}
        <span className="text-foreground">]</span>
      </>
    );
  }
  return <span className="text-[#ce9178]">"{value}"</span>;
}

export function About() {
  const { data: about } = useAboutSection();
  const { data: codeLines } = useCodeCard();

  const eyebrow = about?.eyebrow || "About Me";
  const heading = about?.heading || "Crafting Code,";
  const headingAccent = about?.heading_accent || "Solving Problems.";
  const paragraphs = (about?.description || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const tags = about?.tags?.length ? about.tags : personalInfo.interests;
  const stats: AboutStat[] = Array.isArray(about?.stats) ? (about?.stats as AboutStat[]) : [];
  const codeFile = about?.code_file_name || "developer.ts";
  const lines = codeLines ?? [];


  return (
    <Section id="about">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Reveal className="space-y-6">
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground">
            {heading} <span className="text-gradient">{headingAccent}</span>
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                #{tag.replace(/\s+/g, "")}
              </span>
            ))}
          </div>
        </Reveal>


        <Reveal delay={0.15} className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-elevated/60">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 text-xs font-mono text-text-muted">{codeFile}</span>
            </div>
            <pre className="px-5 py-5 text-sm leading-relaxed font-mono overflow-x-auto">
              <code>
                <span className="text-[#c586c0]">const</span>{" "}
                <span className="text-[#4fc1ff]">developer</span>{" "}
                <span className="text-foreground">=</span>{" "}
                <span className="text-foreground">{"{"}</span>
                {lines.map((line, i) => (
                  <span key={line.id}>
                    {"\n  "}
                    <span className="text-[#9cdcfe]">{line.property_name}</span>
                    <span className="text-foreground">:</span>{" "}
                    <CodeValue type={line.value_type} value={line.property_value} />
                    {i < lines.length - 1 && <span className="text-foreground">,</span>}
                  </span>
                ))}
                {"\n"}
                <span className="text-foreground">{"};"}</span>
              </code>
            </pre>

          </div>
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div key={s.label + i} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="font-display font-extrabold text-3xl text-gradient">{s.value}</div>
                  <div className="text-sm text-text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
