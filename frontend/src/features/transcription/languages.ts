export type LanguageCode =
  | "auto"
  | "id"
  | "en"
  | "zh"
  | "ja"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "ru";

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "auto", label: "Deteksi otomatis" },
  { code: "id", label: "Indonesia" },
  { code: "en", label: "Inggris" },
  { code: "zh", label: "Mandarin" },
  { code: "ja", label: "Jepang" },
  { code: "ko", label: "Korea" },
  { code: "es", label: "Spanyol" },
  { code: "fr", label: "Prancis" },
  { code: "de", label: "Jerman" },
  { code: "ru", label: "Rusia" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "auto";
