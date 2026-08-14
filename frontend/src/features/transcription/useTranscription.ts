import { useCallback, useMemo, useState } from "react";
import type { Transcription } from "./types";
import { transcribeAudio } from "./transcriber";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createTranscription(): Transcription {
  return {
    id: uid(),
    title: "Audio baru",
    audio: null,
    text: "",
    status: "empty",
    createdAt: Date.now(),
  };
}

export function useTranscription() {
  const [items, setItems] = useState<Transcription[]>(() => [
    createTranscription(),
  ]);
  const [activeId, setActiveId] = useState(() => items[0].id);

  const active = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0],
    [items, activeId],
  );

  const patch = useCallback(
    (id: string, next: (item: Transcription) => Transcription) => {
      setItems((prev) => prev.map((item) => (item.id === id ? next(item) : item)));
    },
    [],
  );

  const newAudio = useCallback(() => {
    const item = createTranscription();
    setItems((prev) => [item, ...prev]);
    setActiveId(item.id);
  }, []);

  const select = useCallback((id: string) => setActiveId(id), []);

  const rename = useCallback(
    (id: string, title: string) => {
      const next = title.trim() || "Audio baru";
      patch(id, (item) => ({ ...item, title: next }));
    },
    [patch],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.audio) URL.revokeObjectURL(target.audio.url);

      const rest = prev.filter((item) => item.id !== id);
      const next = rest.length > 0 ? rest : [createTranscription()];

      setActiveId((current) =>
        current === id ? next[0].id : current,
      );
      return next;
    });
  }, []);

  const transcribe = useCallback(
    async (file: File) => {
      const targetId = active.id;

      if (active.audio) URL.revokeObjectURL(active.audio.url);

      patch(targetId, (item) => ({
        ...item,
        title: file.name,
        audio: { name: file.name, size: file.size, url: URL.createObjectURL(file) },
        text: "",
        status: "processing",
      }));

      try {
        const text = await transcribeAudio(file);
        patch(targetId, (item) => ({ ...item, text, status: "done" }));
      } catch {
        patch(targetId, (item) => ({ ...item, status: "error" }));
      }
    },
    [active.id, active.audio, patch],
  );

  const reset = useCallback(() => {
    const targetId = active.id;
    if (active.audio) URL.revokeObjectURL(active.audio.url);
    patch(targetId, (item) => ({
      ...item,
      audio: null,
      text: "",
      status: "empty",
      title: "Audio baru",
    }));
  }, [active.id, active.audio, patch]);

  return {
    items,
    active,
    activeId,
    newAudio,
    select,
    rename,
    remove,
    transcribe,
    reset,
  };
}
