export type TranscriptionStatus = "empty" | "processing" | "done" | "error";

export interface AudioMeta {
  name: string;
  size: number;
  url: string;
}

export interface Transcription {
  id: string;
  title: string;
  audio: AudioMeta | null;
  text: string;
  status: TranscriptionStatus;
  createdAt: number;
}
