import { Mic, PanelLeftClose, Heart } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../atoms/Button";
import { IconButton } from "../atoms/IconButton";
import { Logo } from "../atoms/Logo";
import { GithubMark } from "../atoms/GithubMark";
import { TranscriptionItem } from "../molecules/TranscriptionItem";
import { SidebarLink } from "../molecules/SidebarLink";
import type { Transcription } from "../../features/transcription/types";

const DONATE_URL = "https://saweria.co/";
const GITHUB_URL = "https://github.com/";

interface SidebarProps {
  items: Transcription[];
  activeId: string;
  open: boolean;
  onSelect: (id: string) => void;
  onNewAudio: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function Sidebar({
  items,
  activeId,
  open,
  onSelect,
  onNewAudio,
  onRename,
  onDelete,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border-subtle bg-surface transition-all duration-200",
        open ? "w-64" : "w-0 overflow-hidden border-r-0",
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <span className="flex items-center gap-2 px-1">
          <Logo size={26} />
          <span className="font-semibold text-content-primary">Tulisin</span>
        </span>
        <IconButton label="Sembunyikan panel" onClick={onClose}>
          <PanelLeftClose size={18} />
        </IconButton>
      </div>

      <div className="px-3 pb-2">
        <Button variant="outline" onClick={onNewAudio} className="w-full justify-start">
          <Mic size={16} />
          Audio baru
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-content-muted">
          Riwayat
        </p>
        {items.map((item) => (
          <TranscriptionItem
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-border-subtle px-3 py-3">
        <SidebarLink href={DONATE_URL} icon={<Heart size={16} />}>
          Donate me
        </SidebarLink>
        <SidebarLink href={GITHUB_URL} icon={<GithubMark size={16} />}>
          GitHub
        </SidebarLink>
      </div>
    </aside>
  );
}
