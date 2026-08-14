import { Moon, PanelLeftOpen, Sun } from "lucide-react";
import { IconButton } from "../atoms/IconButton";
import type { Theme } from "../../theme/theme";

interface TopbarProps {
  sidebarOpen: boolean;
  theme: Theme;
  onOpenSidebar: () => void;
  onToggleTheme: () => void;
}

export function Topbar({
  sidebarOpen,
  theme,
  onOpenSidebar,
  onToggleTheme,
}: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle px-3">
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <IconButton label="Tampilkan panel" onClick={onOpenSidebar}>
            <PanelLeftOpen size={18} />
          </IconButton>
        )}
        <span className="font-medium text-content-primary">Tulisin</span>
      </div>
      <IconButton
        label={theme === "dark" ? "Mode terang" : "Mode gelap"}
        onClick={onToggleTheme}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>
    </header>
  );
}
