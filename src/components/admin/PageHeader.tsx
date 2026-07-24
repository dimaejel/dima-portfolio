import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg bg-elevated border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary " +
        (props.className ?? "")
      }
    />
  );
}

export function AdminTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-lg bg-elevated border border-border text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-24 " +
        (props.className ?? "")
      }
    />
  );
}

export function AdminLabel({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">{children}</label>;
}

export function AdminButton({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const base = "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-gradient-brand text-white hover:brightness-110",
    ghost: "border border-border text-foreground hover:border-primary/40 hover:text-primary",
    danger: "border border-red-500/40 text-red-400 hover:bg-red-500/10",
  };
  return <button {...props} className={`${base} ${variants[variant]} ${props.className ?? ""}`} />;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center text-sm text-text-muted">
      {children}
    </div>
  );
}
