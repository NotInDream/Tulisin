import { apiUpload } from "../../lib/api";
import type { TranscriptionResult } from "./types";

interface TranscribeResponse {
  name: string;
  audio_file: string;
  output: string;
}

export async function transcribeAudio(file: File): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiUpload<TranscribeResponse>("/transcribe/", formData);

  return { text: data.output, audioFile: data.audio_file };
}
