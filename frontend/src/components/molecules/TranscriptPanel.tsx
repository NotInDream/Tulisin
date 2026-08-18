import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  GripVertical,
  Loader2,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../atoms/Button";
import { IconButton } from "../atoms/IconButton";
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
  onPreview?: (start: number, end: number) => void;
  onSave?: (text: string, segments: TranscriptSegment[] | null) => void;
}

interface SegmentDraft {
  start: string;
  end: string;
  text: string;
}

const DEFAULT_SEGMENT_DURATION = 3;

function segmentWarning(
  segments: SegmentDraft[],
  index: number,
): string | null {
  const start = toSeconds(segments[index].start);
  const end = toSeconds(segments[index].end);
  if (end < start) return "Waktu selesai lebih kecil dari waktu mulai.";
  if (index > 0 && start < toSeconds(segments[index - 1].end)) {
    return "Waktu tumpang tindih dengan segmen di atasnya.";
  }
  return null;
}

function activeSegmentIndex(
  segments: TranscriptSegment[],
  time: number,
): number {
  let index = -1;
  let best = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].start <= time && segments[i].start > best) {
      best = segments[i].start;
      index = i;
    }
  }
  return index;
}

function toSeconds(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function sanitizeTime(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
}

export function TranscriptPanel({
  status,
  text,
  segments,
  currentTime = 0,
  onSeek,
  onPreview,
  onSave,
}: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [draftSegments, setDraftSegments] = useState<SegmentDraft[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const hasSegments = Boolean(segments && segments.length > 0);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const startEdit = () => {
    setDraft(text);
    setDraftSegments(
      hasSegments
        ? segments!.map((segment) => ({
            start: String(segment.start),
            end: String(segment.end),
            text: segment.text,
          }))
        : [],
    );
    setEditing(true);
  };

  const updateSegment = (index: number, patch: Partial<SegmentDraft>) => {
    setDraftSegments((prev) =>
      prev.map((segment, i) =>
        i === index ? { ...segment, ...patch } : segment,
      ),
    );
  };

  const addSegmentAfter = (index: number) => {
    setDraftSegments((prev) => {
      const current = prev[index];
      const following = prev[index + 1];
      const start = toSeconds(current.end);
      const gapEnd = following
        ? toSeconds(following.start)
        : start + DEFAULT_SEGMENT_DURATION;
      const end = gapEnd > start ? gapEnd : start + DEFAULT_SEGMENT_DURATION;
      const next = [...prev];
      next.splice(index + 1, 0, {
        start: String(start),
        end: String(end),
        text: "",
      });
      return next;
    });
  };

  const removeSegment = (index: number) => {
    setDraftSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const normalizeSegment = (index: number) => {
    setDraftSegments((prev) =>
      prev.map((segment, i) => {
        if (i !== index) return segment;
        const start = Math.max(0, toSeconds(segment.start));
        const end = Math.max(start, toSeconds(segment.end));
        return { ...segment, start: String(start), end: String(end) };
      }),
    );
  };

  const reorderSegment = (from: number, to: number) => {
    setDraftSegments((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const save = () => {
    if (hasSegments) {
      const cleaned = draftSegments
        .map((segment) => {
          const start = Math.max(0, toSeconds(segment.start));
          const end = Math.max(start, toSeconds(segment.end));
          return { start, end, text: segment.text.trim() };
        })
        .filter((segment) => segment.text.length > 0);
      const joined = cleaned
        .map((segment) => segment.text)
        .join(" ")
        .trim();
      onSave?.(joined, cleaned);
    } else {
      onSave?.(draft.trim(), segments ?? null);
    }
    setEditing(false);
  };

  return (
    <section className="flex min-h-64 flex-col rounded-2xl border border-border-subtle bg-surface">
      <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-semibold text-content-primary">
          Transkrip
        </h2>
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

        {status === "done" && !editing && hasSegments && (
          <ol className="flex flex-col gap-0.5">
            {segments!.map((segment, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => onSeek?.(segment.start)}
                  className={cn(
                    "flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-left leading-7 transition-colors",
                    index === activeSegmentIndex(segments!, currentTime)
                      ? "font-medium text-content-primary"
                      : "text-content-muted hover:text-content-secondary",
                  )}
                >
                  <span>{segment.text.trim()}</span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {status === "done" && !editing && !hasSegments && (
          <p className="whitespace-pre-wrap break-words leading-7 text-content-primary">
            {text}
          </p>
        )}

        {status === "done" && editing && hasSegments && (
          <ol className="flex flex-col gap-3">
            {draftSegments.map((segment, index) => {
              const warning = segmentWarning(draftSegments, index);
              return (
              <li
                key={index}
                onDragOver={(event) => {
                  if (dragIndex === null || dragIndex === index) return;
                  event.preventDefault();
                  reorderSegment(dragIndex, index);
                  setDragIndex(index);
                }}
                className={cn(
                  "rounded-lg border p-3 transition-opacity",
                  warning ? "border-border-strong" : "border-border-subtle",
                  dragIndex === index && "opacity-50",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    aria-label="Seret untuk mengurutkan"
                    title="Seret untuk mengurutkan"
                    className="cursor-grab text-content-muted transition-colors hover:text-content-secondary active:cursor-grabbing"
                  >
                    <GripVertical size={16} />
                  </button>
                  <label className="text-xs text-content-muted">Mulai</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={segment.start}
                    onChange={(event) =>
                      updateSegment(index, {
                        start: sanitizeTime(event.target.value),
                      })
                    }
                    onBlur={() => normalizeSegment(index)}
                    className="w-20 rounded-md border border-border-strong bg-canvas px-2 py-1 text-sm tabular-nums text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <label className="text-xs text-content-muted">Selesai</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={segment.end}
                    onChange={(event) =>
                      updateSegment(index, {
                        end: sanitizeTime(event.target.value),
                      })
                    }
                    onBlur={() => normalizeSegment(index)}
                    className="w-20 rounded-md border border-border-strong bg-canvas px-2 py-1 text-sm tabular-nums text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onPreview?.(
                        toSeconds(segment.start),
                        toSeconds(segment.end),
                      )
                    }
                  >
                    <Play size={14} />
                    Tes
                  </Button>
                  <div className="ml-auto flex items-center gap-1">
                    <IconButton
                      label="Tambah segmen di bawah"
                      onClick={() => addSegmentAfter(index)}
                      className="h-8 w-8"
                    >
                      <Plus size={16} />
                    </IconButton>
                    <IconButton
                      label="Hapus segmen"
                      onClick={() => removeSegment(index)}
                      className="h-8 w-8 hover:bg-danger-surface hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>
                </div>
                <textarea
                  value={segment.text}
                  onChange={(event) =>
                    updateSegment(index, { text: event.target.value })
                  }
                  rows={2}
                  className="mt-2 w-full resize-none rounded-md border border-border-strong bg-canvas p-2 leading-7 text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {warning && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-content-secondary">
                    <AlertTriangle size={13} className="shrink-0" />
                    {warning}
                  </p>
                )}
              </li>
              );
            })}
            {draftSegments.length === 0 && (
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraftSegments([{ start: "0", end: "0", text: "" }])
                  }
                >
                  <Plus size={15} />
                  Tambah segmen
                </Button>
              </li>
            )}
          </ol>
        )}

        {status === "done" && editing && !hasSegments && (
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
