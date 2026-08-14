import { FileAudio, X } from "lucide-react";
import { IconButton } from "../atoms/IconButton";
import { formatBytes } from "../../lib/format";
import type { AudioMeta } from "../../features/transcription/types";

interface AudioPreviewProps {
  audio: AudioMeta;
  onRemove: () => void;
}

export function AudioPreview({ audio, onRemove }: AudioPreviewProps) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-content-secondary">
          <FileAudio size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-content-primary">
            {audio.name}
          </p>
          <p className="text-xs text-content-muted">{formatBytes(audio.size)}</p>
        </div>
        <IconButton label="Hapus audio" onClick={onRemove}>
          <X size={18} />
        </IconButton>
      </div>
      <audio controls src={audio.url} className="mt-3 w-full">
        <track kind="captions" />
      </audio>
    </div>
  );
}
