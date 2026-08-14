# Tulisin — Frontend

Aplikasi **speech-to-text**: pengguna mengunggah audio, aplikasi mengembalikan transkrip. UI bergaya ChatGPT, monochrome (hitam–putih), React 19 + Vite + Tailwind v4.

## Perintah

```bash
npm run dev      # dev server
npm run build    # tsc -b + vite build
npm run lint     # eslint
```

## Aturan wajib

1. **Tanpa komentar di kode.** Jelaskan keputusan lewat chat, bukan komentar. Kode harus terbaca sendiri lewat penamaan yang jelas.
2. **Warna hanya lewat token.** Jangan pernah menulis nilai warna literal (`#000`, `bg-black`, `text-white`, `bg-neutral-900`) di komponen. Pakai utility token: `bg-canvas`, `bg-surface`, `text-content-primary`, `border-border-subtle`, `bg-accent`, dst.
3. **Ikon dari `lucide-react`.** Jangan pakai emoji sebagai ikon. Pengecualian: brand-mark yang dibuang lucide (mis. GitHub) boleh jadi atom SVG tersendiri di `components/atoms/` — lihat `GithubMark`.
4. **Palet monochrome.** Netral saja (hitam → putih). Satu-satunya hue berwarna adalah token `danger` (merah) khusus aksi destruktif seperti Hapus — dipakai lewat `text-danger` / `bg-danger-surface`, bukan nilai literal.

## Sistem warna (atomic tokens)

Sumber kebenaran: `src/styles.css`. Tiga lapisan:

- **Primitive** — `--tone-0` (putih) … `--tone-1000` (hitam). Tangga netral mentah.
- **Semantic** — memetakan primitive ke peran: `--canvas`, `--surface`, `--surface-hover`, `--border-subtle`, `--border-strong`, `--content-primary`, `--content-secondary`, `--content-muted`, `--accent`, `--accent-content`, `--ring`.
- **Tailwind** — `@theme inline` mengubah tiap semantic jadi utility (mis. `--color-content-primary` → `text-content-primary`).

Ganti tema = timpa lapisan semantic saja. `[data-theme="dark"]` membalik peran; komponen tidak berubah. Untuk menyetel ulang preferensi warna, edit blok `:root` / `[data-theme="dark"]`, **bukan** komponen.

## Struktur (Atomic Design)

```
src/
  components/
    atoms/       Button, IconButton, Logo, GithubMark
    molecules/   Dropzone, AudioPreview, TranscriptPanel, TranscriptionItem, SidebarLink
    organisms/   Sidebar, Topbar, Workspace
    templates/   AppShell
  features/transcription/  types, useTranscription (state), transcriber (stub STT)
  theme/         theme (token + persist), useTheme
  lib/           cn (penggabung className), format (formatBytes)
```

Aturan komposisi: atom tidak mengimpor molecule/organism; data mengalir turun lewat props; state transkripsi hidup di `useTranscription`, preferensi tema di `useTheme`.

Alur UI: kiri = daftar audio + "Audio baru" + footer (Donate/GitHub). Tengah = `Dropzone` saat kosong, lalu `AudioPreview` + `TranscriptPanel` setelah audio diunggah. Status transkripsi: `empty → processing → done | error`.

## Menyambung backend

`src/features/transcription/transcriber.ts` masih stub. Ganti `transcribeAudio(file)` dengan panggilan API speech-to-text asli (kembalikan `Promise<string>`, atau ubah ke streaming). `useTranscription` tidak perlu diubah. Link Donate/GitHub ada di konstanta atas `Sidebar.tsx`.

## Konvensi

- TypeScript strict; komponen sebagai named export (kecuali `App` default).
- Styling hanya Tailwind + token. Tanpa CSS module / styled-components.
- Teks UI berbahasa Indonesia.
- Bersikaplah sebagai senior frontend React developer: komponen kecil dan fokus, props eksplisit, tanpa abstraksi berlebih.
