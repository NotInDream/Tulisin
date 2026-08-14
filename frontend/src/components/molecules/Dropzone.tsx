import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "../../lib/cn";

interface DropzoneProps {
  onFile: (file: File) => void;
}

export function Dropzone({ onFile }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const pickAudio = (files: FileList | null) => {
    const file = Array.from(files ?? []).find((item) =>
      item.type.startsWith("audio/"),
    );
    if (file) onFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    pickAudio(event.dataTransfer.files);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dragging
          ? "border-content-primary bg-surface-hover"
          : "border-border-strong bg-surface hover:bg-surface-hover",
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-content-secondary">
        <UploadCloud size={22} />
      </span>
      <span className="text-base font-medium text-content-primary">
        Unggah berkas audio
      </span>
      <span className="text-sm text-content-muted">
        Seret &amp; letakkan, atau klik untuk memilih · MP3, WAV, M4A
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(event) => {
          pickAudio(event.target.files);
          event.target.value = "";
        }}
      />
    </button>
  );
}
