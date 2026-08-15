export interface History {
  id: number;
  name: string;
  audio_file: string;
  output: string;
  created_at: string;
  updated_at: string;
}

export type HistoryInput = Pick<History, "name" | "audio_file" | "output">;
