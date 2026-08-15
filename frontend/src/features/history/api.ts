import { api } from "../../lib/api";
import type { History, HistoryInput } from "./types";

export function listHistory(): Promise<History[]> {
  return api<History[]>("/history/");
}

export function createHistory(input: HistoryInput): Promise<History> {
  return api<History>("/history/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateHistory(id: number, input: HistoryInput): Promise<History> {
  return api<History>(`/history/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteHistory(id: number): Promise<void> {
  return api<void>(`/history/${id}`, { method: "DELETE" });
}
