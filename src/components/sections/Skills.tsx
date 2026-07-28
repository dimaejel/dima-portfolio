import { useState } from "react";
import { motion } from "motion/react";
import { skillGroups } from "@/data/portfolio";
import { useSkills } from "@/hooks/use-portfolio";
import type { Skill } from "@/lib/cms";
import { skillIconUrl, slugForSkill } from "@/lib/skill-icons";
import { Reveal, Section, SectionEyebrow, staggerContainer, staggerItem } from "./_shared";

type SkillItem = { name: string; badge: string; color: string; slug: string | null };
type Group = { title: string; skills: SkillItem[] };

function groupSkills(rows: Skill[]): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    if (!map.has(r.category)) map.set(r.category, { title: r.category, skills: [] });
    map.get(r.category)!.skills.push({
      name: r.name,
      badge: r.badge || r.name.slice(0, 2),
      color: r.color,
      slug: slugForSkill(r.name, r.icon_slug),
    });
  }
  return Array.from(map.values());
}

function fallbackGroups(): Group[] {
  return skillGroups.map((g) => ({
    title: g.title,
    skills: g.skills.map((s) => ({ ...s, slug: slugForSkill(s.name) })),
  }));
}

function SkillLogo({ skill }: { skill: SkillItem }) {
  const [failed, setFailed] = useState(false);
  const showLogo = skill.slug && !failed;

  return (
    <span
      className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70"
      aria-hidden
    >
      {showLogo ? (
        <img
          src={skillIconUrl(skill.slug!)}
          alt=""
          loading="lazy"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-display text-[11px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${skill.color}, ${skill.color}aa)` }}
        >
          {skill.badge}
        </span>
      )}
    </span>
  );
}

export function Skills() {
  const { data } = useSkills();
  const groups: Group[] = data && data.length ? groupSkills(data) : fallbackGroups();

  return (
    <Section id="skills" className="bg-surface/60">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <SectionEyebrow align="center">My Technical Arsenal</SectionEyebrow>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground mt-3">
          Technologies I've worked with
        </h2>
        <p className="text-text-secondary mt-4">
          A toolkit shaped by curiosity, coursework, and real projects — from systems-level
          languages to modern web stacks.
        </p>
      </Reveal>

      <div className="space-y-12">
        {groups.map((group) => (
          <Reveal key={group.title}>
            <div className="flex items-center gap-4 mb-5">
              <h3 className="font-display font-bold text-foreground text-lg">{group.title}</h3>
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-xs text-text-muted">
                {group.skills.length.toString().padStart(2, "0")}
              </span>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {group.skills.map((skill) => (
                <motion.div
                  key={skill.name}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-elevated px-4 py-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(79,142,247,0.15)]"
                >
                  <SkillLogo skill={skill} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{skill.name}</div>
                    <div className="mt-0.5 text-[11px] font-mono uppercase tracking-wider text-text-muted">
                      {group.title}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
