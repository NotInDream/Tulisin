export function transcribeAudio(file: File): Promise<string> {
  const sample = `Ini adalah hasil speech-to-text contoh untuk berkas "${file.name}".

Sambungkan fungsi transcribeAudio di src/features/transcription/transcriber.ts ke API speech-to-text milikmu untuk mendapatkan transkrip sungguhan. Fungsi ini cukup mengembalikan Promise<string>, atau ubah menjadi streaming bila API-mu mendukung.`;

  return new Promise((resolve) => {
    setTimeout(() => resolve(sample), 1800);
  });
}
