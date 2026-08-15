import { FileAudio, Info } from "lucide-react";
import { TranscriptPanel } from "../molecules/TranscriptPanel";
import { historyAudioUrl } from "../../features/history/audio";
import type { History } from "../../features/history/types";

interface HistoryDetailProps {
  item: History;
  onSave: (text: string) => void;
}

export function HistoryDetail({ item, onSave }: HistoryDetailProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <div className="rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-content-secondary">
              <FileAudio size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-content-primary">
                {item.name}
              </p>
              <p className="text-xs text-content-muted">Riwayat tersimpan</p>
            </div>
          </div>
          <audio
            controls
            src={historyAudioUrl(item.audio_file)}
            className="mt-3 w-full"
          >
            <track kind="captions" />
          </audio>
        </div>

        <TranscriptPanel status="done" text={item.output} onSave={onSave} />
        <div className="flex items-center gap-2 rounded-lg justify-center text-content-muted">
          <p className="flex items-center gap-2 text-xs text-content-muted">
            Tulisin bisa saja kurang akurat. Mohon periksa kembali, dan edit
            bila ada yang keliru.
          </p>
        </div>
      </div>
    </div>
  );
}
