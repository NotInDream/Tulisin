import { Logo } from "../atoms/Logo";
import { Dropzone } from "../molecules/Dropzone";
import { AudioPreview } from "../molecules/AudioPreview";
import { TranscriptPanel } from "../molecules/TranscriptPanel";
import type { Transcription } from "../../features/transcription/types";

interface WorkspaceProps {
  active: Transcription;
  onFile: (file: File) => void;
  onRemove: () => void;
}

export function Workspace({ active, onFile, onRemove }: WorkspaceProps) {
  if (active.status === "empty" || !active.audio) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-8">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center text-center">
            <Logo size={72} className="mb-6" />
            <h1 className="text-3xl font-semibold tracking-tight text-content-primary">
              Kamu Rekam, Kami Tulisin
            </h1>
            <p className="mt-3 text-content-secondary">
              Upload audio, biar Tulisin yang menuliskannya untukmu.
            </p>
          </div>
          <div className="mt-10">
            <Dropzone onFile={onFile} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
        <AudioPreview audio={active.audio} onRemove={onRemove} />
        <TranscriptPanel status={active.status} text={active.text} />
      </div>
    </div>
  );
}
