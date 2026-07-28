import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { navLinks, personalInfo } from "@/data/portfolio";
import { useSiteProfile } from "@/hooks/use-portfolio";
import { DownloadCvButton } from "@/components/DownloadCvButton";
import { useIsAdmin, signOut } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export function Navbar() {
  const profile = useSiteProfile();
  const name = profile?.name || personalInfo.name;
  const initials = profile?.initials || personalInfo.initials;
  const { isAdmin, signedIn } = useIsAdmin();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("home");


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);


  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3 group">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white font-bold text-sm shadow-[0_4px_20px_rgba(79,142,247,0.35)]">
              {initials}
            </span>
            <span className="font-display font-bold text-foreground">
              {name}
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.slice(0, 6).map((l) => {
              const isActive = active === l.href.slice(1);
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-text-secondary hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-brand" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <DownloadCvButton
              resumeValue={profile?.resume_url}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/70 disabled:opacity-70"
            />
            {signedIn && isAdmin && (
              <a
                href="/admin"
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:border-primary/40 hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin
              </a>
            )}
            {signedIn && (
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of your account"
                aria-label="Sign out"
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium text-text-secondary hover:border-red-500/50 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md"
            >
              <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-text-secondary hover:bg-elevated hover:text-foreground"
                  >
                    {l.label}
                  </motion.a>
                ))}
                <DownloadCvButton
                  resumeValue={profile?.resume_url}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-brand px-3 py-3 text-sm font-semibold text-white sm:hidden disabled:opacity-70"
                />
                {signedIn && (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-3 text-sm font-medium text-text-secondary hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
