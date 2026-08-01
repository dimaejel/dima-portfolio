import { personalInfo } from "@/data/portfolio";
import { useAboutSection } from "@/hooks/use-portfolio";
import { Reveal, Section, SectionEyebrow } from "./_shared";

type AboutStat = { value: string; label: string };

export function About() {
  const { data: about } = useAboutSection();

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
  const codeName = about?.code_name || personalInfo.name;
  const codeRole = about?.code_role || "CS Graduate";
  const codeSkills = about?.code_skills?.length ? about.code_skills : ["Java", "React", "Node.js"];
  const codeAvailable = about?.code_available ?? true;
  const codeCoffee = about?.code_coffee || "Infinity";

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
                {"\n  "}
                <span className="text-[#9cdcfe]">name</span>
                <span className="text-foreground">:</span>{" "}
                <span className="text-[#ce9178]">"{codeName}"</span>
                <span className="text-foreground">,</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">role</span>
                <span className="text-foreground">:</span>{" "}
                <span className="text-[#ce9178]">"{codeRole}"</span>
                <span className="text-foreground">,</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">skills</span>
                <span className="text-foreground">: [</span>
                {codeSkills.map((s, i) => (
                  <span key={s + i}>
                    <span className="text-[#ce9178]">"{s}"</span>
                    {i < codeSkills.length - 1 && <span className="text-foreground">, </span>}
                  </span>
                ))}
                <span className="text-foreground">],</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">available</span>
                <span className="text-foreground">:</span>{" "}
                <span className="text-[#569cd6]">{String(codeAvailable)}</span>
                <span className="text-foreground">,</span>
                {"\n  "}
                <span className="text-[#9cdcfe]">coffee</span>
                <span className="text-foreground">:</span>{" "}
                <span className="text-[#4fc1ff]">{codeCoffee}</span>
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
