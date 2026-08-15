import { useCallback, useState } from "react";
import type { Transcription, TranscriptionResult } from "./types";
import { transcribeAudio } from "./transcriber";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useTranscription() {
  const [active, setActive] = useState<Transcription | null>(null);

  const clear = useCallback(() => {
    setActive((prev) => {
      if (prev?.audio) URL.revokeObjectURL(prev.audio.url);
      return null;
    });
  }, []);

  const transcribe = useCallback(
    async (file: File): Promise<TranscriptionResult | null> => {
      const id = uid();
      setActive((prev) => {
        if (prev?.audio) URL.revokeObjectURL(prev.audio.url);
        return {
          id,
          title: file.name,
          audio: {
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
          },
          audioFile: null,
          text: "",
          status: "processing",
          createdAt: Date.now(),
        };
      });

      try {
        return await transcribeAudio(file);
      } catch {
        setActive((prev) =>
          prev && prev.id === id ? { ...prev, status: "error" } : prev,
        );
        return null;
      }
    },
    [],
  );

  return { active, transcribe, clear };
}
