import { assetUrl } from "../../lib/api";

export function historyAudioUrl(audioFile: string): string {
  return assetUrl(`audio/${audioFile}`);
}
