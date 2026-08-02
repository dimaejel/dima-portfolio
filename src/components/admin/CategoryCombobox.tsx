import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

/**
 * Searchable category picker: choose an existing category or type a new one
 * and confirm with "+ Create ...".
 */
export function CategoryCombobox({
  value,
  options,
  onChange,
  placeholder = "Search or create a category…",
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const trimmed = query.trim();
  const filtered = useMemo(
    () =>
      options.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase())),
    [options, trimmed],
  );
  const canCreate =
    trimmed.length > 0 && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const pick = (v: string) => {
    onChange(v);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-elevated px-3 py-2 text-left text-sm text-foreground focus:outline-none focus:border-primary"
      >
        <span className={value ? "" : "text-text-muted"}>{value || "Select a category"}</span>
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length) pick(filtered[0]);
                else if (canCreate) pick(trimmed);
              }
            }}
            placeholder={placeholder}
            className="w-full border-b border-border bg-elevated px-3 py-2 text-sm text-foreground focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => pick(o)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-foreground hover:bg-elevated"
              >
                {o}
                {o === value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={() => pick(trimmed)}
                className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" /> Create "{trimmed}"
              </button>
            )}
            {!filtered.length && !canCreate && (
              <div className="px-3 py-3 text-sm text-text-muted">No categories yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
