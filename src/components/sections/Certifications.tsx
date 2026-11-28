import { Award, ExternalLink } from "lucide-react";
import { certifications as fallback } from "@/data/portfolio";
import { useCertificationsQ } from "@/hooks/use-portfolio";
import { Reveal, Section, SectionEyebrow } from "./_shared";
import { useMediaUrl } from "@/components/MediaImage";

export function Certifications() {
  const { data } = useCertificationsQ();
  const items = data
    ? data.map((c) => ({
        title: c.title,
        issuer: c.issuer,
        date: c.date,
        link: c.link ?? "",
        gradient: c.gradient || "from-blue-500 to-violet-500",
        image: c.image_url,
        document: c.document_url,
      }))
    : fallback.map((c) => ({ ...c, image: null, document: null }));

  return (
    <Section id="certifications">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <SectionEyebrow align="center">Certifications</SectionEyebrow>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground mt-3">
          Continuous Learning
        </h2>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((c, i) => (
          <Reveal key={c.title + i} delay={i * 0.05}>
            <CertificateCard certificate={c} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function CertificateCard({ certificate: c }: { certificate: { title: string; issuer: string; date: string; link: string; gradient: string; image: string | null; document: string | null } }) {
  const image = useMediaUrl(c.image);
  const link = useMediaUrl(c.document || c.link);
  return (
            <article className="group h-full rounded-2xl border border-border bg-surface overflow-hidden transition-all hover:border-primary/40 hover:-translate-y-1">
              <div className={`relative h-36 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                <div className="absolute inset-0 dot-grid opacity-20" />
                {image ? <img src={image} alt={`${c.title} certificate`} className="absolute inset-0 h-full w-full object-contain" /> : <Award className="h-14 w-14 text-primary-foreground" strokeWidth={1.4} />}
              </div>
              <div className="p-5 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{c.issuer}</span>
                <h3 className="font-display font-bold text-foreground leading-snug">{c.title}</h3>
                <p className="text-sm text-text-secondary">{c.date}</p>
                {link && (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors">
                    Verify Certificate <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
  );
}
