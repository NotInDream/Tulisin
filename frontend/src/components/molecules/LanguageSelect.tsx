import { useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { cn } from "../../lib/cn";
import { useClickOutside } from "../../lib/useClickOutside";
import {
  LANGUAGES,
  type LanguageCode,
} from "../../features/transcription/languages";

interface LanguageSelectProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const current = LANGUAGES.find((item) => item.code === value) ?? LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Languages size={16} className="shrink-0 text-content-secondary" />
        <span className="text-content-primary">{current.label}</span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-content-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-10 max-h-72 w-52 overflow-y-auto rounded-lg border border-border-subtle bg-surface p-1 shadow-lg">
          {LANGUAGES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                onChange(item.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                item.code === value
                  ? "bg-surface-hover text-content-primary"
                  : "text-content-secondary hover:bg-surface-hover hover:text-content-primary",
              )}
            >
              <span>{item.label}</span>
              {item.code === value && <Check size={15} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
