import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FileAudio, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { useClickOutside } from "../../lib/useClickOutside";
import { IconButton } from "../atoms/IconButton";
import { MenuItem } from "../atoms/MenuItem";
import type { Transcription } from "../../features/transcription/types";

interface TranscriptionItemProps {
  item: Transcription;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function TranscriptionItem({
  item,
  active,
  onSelect,
  onRename,
  onDelete,
}: TranscriptionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.title);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const startRename = () => {
    setDraft(item.title);
    setRenaming(true);
    setMenuOpen(false);
  };

  const commitRename = () => {
    onRename(item.id, draft);
    setRenaming(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") setRenaming(false);
  };

  if (renaming) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitRename}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border border-border-strong bg-canvas px-3 py-2 text-sm text-content-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-lg transition-colors",
        active
          ? "bg-surface-hover text-content-primary"
          : "text-content-secondary hover:bg-surface-hover",
      )}
    >
      <button
        onClick={() => onSelect(item.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <FileAudio size={16} className="shrink-0" />
        <span className="truncate">{item.title}</span>
      </button>

      <div ref={menuRef} className="relative pr-1">
        <IconButton
          label="Opsi lainnya"
          onClick={() => setMenuOpen((open) => !open)}
          className={cn(
            "h-7 w-7",
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        >
          <MoreHorizontal size={16} />
        </IconButton>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border-subtle bg-surface p-1 shadow-lg">
            <MenuItem icon={<Pencil size={15} />} onClick={startRename}>
              Ubah nama
            </MenuItem>
            <MenuItem
              icon={<Trash2 size={15} />}
              danger
              onClick={() => {
                setMenuOpen(false);
                onDelete(item.id);
              }}
            >
              Hapus
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}
