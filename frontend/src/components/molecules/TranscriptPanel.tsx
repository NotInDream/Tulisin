import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "../atoms/Button";
import type { TranscriptionStatus } from "../../features/transcription/types";

interface TranscriptPanelProps {
  status: TranscriptionStatus;
  text: string;
}

export function TranscriptPanel({ status, text }: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="flex min-h-64 flex-col rounded-2xl border border-border-subtle bg-surface">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-content-primary">Transkrip</h2>
        {status === "done" && (
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Tersalin" : "Salin"}
          </Button>
        )}
      </header>

      <div className="flex-1 p-4">
        {status === "processing" && (
          <div className="flex h-full items-center justify-center gap-2 py-10 text-content-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Sedang mentranskrip audio…</span>
          </div>
        )}

        {status === "done" && (
          <p className="whitespace-pre-wrap break-words leading-7 text-content-primary">
            {text}
          </p>
        )}

        {status === "error" && (
          <p className="py-10 text-center text-sm text-content-muted">
            Gagal mentranskrip. Coba unggah ulang audionya.
          </p>
        )}
      </div>
    </section>
  );
}
