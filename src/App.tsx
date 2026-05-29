import { ExtractPanel } from '@/components/ExtractPanel';
import { FileListSidebar } from '@/components/FileListSidebar';
import { FooterBar } from '@/components/FooterBar';
import { Toaster } from '@/components/ui/sonner';
import { useExcelExtract } from '@/hooks/useExcelExtract';
import { WindowTitlebar } from './tauri-controls/window-titlebar';

export function App() {
  const {
    files,
    targetHeaders,
    setTargetHeaders,
    isExtracting,
    format,
    setFormat,
    canExtract,
    handleFileAdd,
    removeFile,
    handleExtract,
  } = useExcelExtract();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-apple-canvas-parchment">
      {/* — Global Nav (titlebar) — */}
      <WindowTitlebar className="shrink-0 bg-apple-surface-black text-white select-none">
        <span className="
          pointer-events-none absolute inset-0 flex items-center justify-center text-fine-print font-medium
          tracking-wider text-apple-on-dark/70 uppercase
        "
        >
          Excel 列提取合并器
        </span>
      </WindowTitlebar>

      {/* — Main content area — */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Sidebar */}
          <FileListSidebar
            files={files}
            onAdd={handleFileAdd}
            onRemove={removeFile}
          />

          {/* Main panel */}
          <div className="flex min-h-0 flex-1 flex-col">
            <ExtractPanel
              fileCount={files.length}
              headers={targetHeaders}
              onHeadersChange={setTargetHeaders}
            />
            <FooterBar
              fileCount={files.length}
              format={format}
              onFormatChange={setFormat}
              isExtracting={isExtracting}
              canExtract={canExtract}
              onExtract={handleExtract}
            />
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

export default App;
