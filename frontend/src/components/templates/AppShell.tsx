import { useCallback, useMemo, useState } from "react";
import { Sidebar } from "../organisms/Sidebar";
import { Topbar } from "../organisms/Topbar";
import { Workspace } from "../organisms/Workspace";
import { HistoryDetail } from "../organisms/HistoryDetail";
import { useTranscription } from "../../features/transcription/useTranscription";
import { useHistory } from "../../features/history/useHistory";
import { useTheme } from "../../theme/useTheme";
import type { LanguageCode } from "../../features/transcription/languages";

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const { active, transcribe, clear } = useTranscription();
  const {
    items: history,
    loading: historyLoading,
    error: historyError,
    add: addHistory,
    rename: renameHistory,
    editOutput: editHistoryOutput,
    remove: removeHistory,
  } = useHistory();

  const selectedHistory = useMemo(
    () => history.find((item) => item.id === selectedHistoryId) ?? null,
    [history, selectedHistoryId],
  );

  const handleFile = useCallback(
    async (file: File, language: LanguageCode) => {
      setSelectedHistoryId(null);
      const result = await transcribe(file, language);
      if (result === null) return;
      const created = await addHistory({
        name: file.name,
        audio_file: result.audioFile,
        output: result.text,
        segments: result.segments,
      });
      clear();
      setSelectedHistoryId(created.id);
    },
    [transcribe, addHistory, clear],
  );

  const handleNewAudio = useCallback(() => {
    setSelectedHistoryId(null);
    clear();
  }, [clear]);

  const handleDeleteHistory = useCallback(
    async (id: number) => {
      setSelectedHistoryId((current) => (current === id ? null : current));
      await removeHistory(id);
    },
    [removeHistory],
  );

  return (
    <div className="flex h-full">
      <Sidebar
        history={history}
        historyLoading={historyLoading}
        historyError={historyError}
        selectedHistoryId={selectedHistoryId}
        open={sidebarOpen}
        onSelectHistory={setSelectedHistoryId}
        onNewAudio={handleNewAudio}
        onRenameHistory={renameHistory}
        onDeleteHistory={handleDeleteHistory}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <Topbar
          sidebarOpen={sidebarOpen}
          theme={theme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleTheme={toggleTheme}
        />
        {selectedHistory ? (
          <HistoryDetail
            key={selectedHistory.id}
            item={selectedHistory}
            onSave={(text) => editHistoryOutput(selectedHistory, text)}
          />
        ) : (
          <Workspace active={active} onFile={handleFile} onRemove={handleNewAudio} />
        )}
      </div>
    </div>
  );
}
