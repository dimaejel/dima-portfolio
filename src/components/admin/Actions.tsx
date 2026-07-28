import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { AdminButton } from "./PageHeader";

/**
 * Shared admin action button: icon + label, clear tooltip, accessible name,
 * consistent hover/focus states across every admin page.
 */
export function ActionButton({
  icon,
  label,
  tooltip,
  tone = "neutral",
  compact,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  tooltip: string;
  tone?: "neutral" | "primary" | "danger";
  compact?: boolean;
}) {
  const tones = {
    neutral:
      "border-border text-text-secondary hover:border-primary/40 hover:text-foreground hover:bg-elevated",
    primary: "border-primary/40 text-primary hover:bg-primary/10",
    danger: "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70",
  };
  return (
    <button
      type="button"
      {...rest}
      title={tooltip}
      aria-label={tooltip}
      className={
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 " +
        "disabled:opacity-30 disabled:cursor-not-allowed " +
        tones[tone]
      }
    >
      {icon}
      <span className={compact ? "hidden md:inline" : ""}>{label}</span>
    </button>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "muted" | "warning";
  children: ReactNode;
}) {
  const tones = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    muted: "border-border bg-elevated text-text-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Professional destructive-action confirmation dialog. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <AdminButton variant="ghost" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            autoFocus
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
