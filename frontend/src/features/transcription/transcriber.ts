import { apiUpload } from "../../lib/api";
import type { LanguageCode } from "./languages";
import type { TranscriptSegment, TranscriptionResult } from "./types";

interface TranscribeResponse {
  name: string;
  audio_file: string;
  output: string;
  segments: TranscriptSegment[];
}

export async function transcribeAudio(
  file: File,
  language: LanguageCode,
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const data = await apiUpload<TranscribeResponse>("/transcribe/", formData);

  return {
    text: data.output,
    audioFile: data.audio_file,
    segments: data.segments,
  };
}
