import { useState } from "react";
import { Check, Copy, Loader2, Pencil } from "lucide-react";
import { Button } from "../atoms/Button";
import { cn } from "../../lib/cn";
import type {
  TranscriptSegment,
  TranscriptionStatus,
} from "../../features/transcription/types";

interface TranscriptPanelProps {
  status: TranscriptionStatus;
  text: string;
  segments?: TranscriptSegment[] | null;
  currentTime?: number;
  onSeek?: (time: number) => void;
  onSave?: (text: string) => void;
}

function activeSegmentIndex(
  segments: TranscriptSegment[],
  time: number,
): number {
  let index = -1;
  for (let i = 0; i < segments.length; i++) {
    if (time >= segments[i].start) index = i;
    else break;
  }
  return index;
}

export function TranscriptPanel({
  status,
  text,
  segments,
  currentTime = 0,
  onSeek,
  onSave,
}: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startEdit = () => {
    setDraft(text);
    setEditing(true);
  };

  const save = () => {
    onSave?.(draft.trim());
    setEditing(false);
  };

  return (
    <section className="flex min-h-64 flex-col rounded-2xl border border-border-subtle bg-surface">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-content-primary">Transkrip</h2>
        {status === "done" && !editing && (
          <div className="flex items-center gap-1">
            {onSave && (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Pencil size={15} />
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Tersalin" : "Salin"}
            </Button>
          </div>
        )}
        {status === "done" && editing && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={save}>
              Simpan
            </Button>
          </div>
        )}
      </header>

      <div className="flex-1 p-4">
        {status === "processing" && (
          <div className="flex h-full items-center justify-center gap-2 py-10 text-content-muted">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Sedang mentranskrip audio…</span>
          </div>
        )}

        {status === "done" && !editing && segments && segments.length > 0 && (
          <ol className="flex flex-col gap-0.5">
            {segments.map((segment, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onSeek?.(segment.start)}
                  className={cn(
                    "w-full rounded-md px-2 py-1 text-left leading-7 transition-colors",
                    index === activeSegmentIndex(segments, currentTime)
                      ? "font-medium text-content-primary"
                      : "text-content-muted hover:text-content-secondary",
                  )}
                >
                  {segment.text.trim()}
                </button>
              </li>
            ))}
          </ol>
        )}

        {status === "done" && !editing && !(segments && segments.length > 0) && (
          <p className="whitespace-pre-wrap break-words leading-7 text-content-primary">
            {text}
          </p>
        )}

        {status === "done" && editing && (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-full min-h-56 w-full resize-none rounded-lg border border-border-strong bg-canvas p-3 leading-7 text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
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
