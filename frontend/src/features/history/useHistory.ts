import { useCallback, useEffect, useState } from "react";
import {
  createHistory,
  deleteHistory,
  listHistory,
  updateHistory,
} from "./api";
import type { History, HistoryInput } from "./types";

export function useHistory() {
  const [items, setItems] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listHistory());
    } catch {
      setError("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (input: HistoryInput) => {
    const created = await createHistory(input);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const rename = useCallback(async (item: History, name: string) => {
    const next = name.trim() || item.name;
    const updated = await updateHistory(item.id, {
      name: next,
      audio_file: item.audio_file,
      output: item.output,
    });
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    return updated;
  }, []);

  const editOutput = useCallback(async (item: History, output: string) => {
    const updated = await updateHistory(item.id, {
      name: item.name,
      audio_file: item.audio_file,
      output,
    });
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteHistory(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  useEffect(() => {
    let active = true;
    listHistory()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError("Gagal memuat riwayat");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { items, loading, error, refresh, add, rename, editOutput, remove };
}
