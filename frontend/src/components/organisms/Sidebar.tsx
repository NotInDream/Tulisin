import { Mic, PanelLeftClose, Heart } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton } from "../atoms/IconButton";
import { Logo } from "../atoms/Logo";
import { GithubMark } from "../atoms/GithubMark";
import { HistoryItem } from "../molecules/HistoryItem";
import { SidebarLink } from "../molecules/SidebarLink";
import type { History } from "../../features/history/types";

const DONATE_URL = "https://saweria.co/NotInDream";
const GITHUB_URL = "https://github.com/NotInDream/Tulisin";

interface SidebarProps {
  history: History[];
  historyLoading: boolean;
  historyError: string | null;
  selectedHistoryId: number | null;
  open: boolean;
  onSelectHistory: (id: number) => void;
  onNewAudio: () => void;
  onRenameHistory: (item: History, name: string) => void;
  onDeleteHistory: (id: number) => void;
  onClose: () => void;
}

export function Sidebar({
  history,
  historyLoading,
  historyError,
  selectedHistoryId,
  open,
  onSelectHistory,
  onNewAudio,
  onRenameHistory,
  onDeleteHistory,
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
        <button
          onClick={onNewAudio}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Mic size={16} className="shrink-0" />
          Audio baru
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-content-muted">
          Tersimpan
        </p>
        {historyLoading && (
          <p className="px-3 py-2 text-sm text-content-muted">Memuat riwayat…</p>
        )}
        {historyError && (
          <p className="px-3 py-2 text-sm text-danger">{historyError}</p>
        )}
        {!historyLoading && !historyError && history.length === 0 && (
          <p className="px-3 py-2 text-sm text-content-muted">Belum ada riwayat.</p>
        )}
        {history.map((item) => (
          <HistoryItem
            key={item.id}
            item={item}
            active={item.id === selectedHistoryId}
            onSelect={onSelectHistory}
            onRename={onRenameHistory}
            onDelete={onDeleteHistory}
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
