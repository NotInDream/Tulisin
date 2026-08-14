import { useState } from "react";
import { Sidebar } from "../organisms/Sidebar";
import { Topbar } from "../organisms/Topbar";
import { Workspace } from "../organisms/Workspace";
import { useTranscription } from "../../features/transcription/useTranscription";
import { useTheme } from "../../theme/useTheme";

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const {
    items,
    active,
    activeId,
    newAudio,
    select,
    rename,
    remove,
    transcribe,
    reset,
  } = useTranscription();

  return (
    <div className="flex h-full">
      <Sidebar
        items={items}
        activeId={activeId}
        open={sidebarOpen}
        onSelect={select}
        onNewAudio={newAudio}
        onRename={rename}
        onDelete={remove}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          theme={theme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleTheme={toggleTheme}
        />
        <Workspace active={active} onFile={transcribe} onRemove={reset} />
      </div>
    </div>
  );
}
