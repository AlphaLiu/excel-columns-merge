import type { ExcelFile } from '@/types';
import { FileSpreadsheet, FileText, FolderOpen, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

interface Props {
  files: ExcelFile[];
  onAdd: (list: FileList | null) => void;
  onRemove: (id: string) => void;
}

function FileItem({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="
      group flex items-center justify-between rounded-sm px-3 py-2.5 transition-colors
      hover:bg-apple-hairline/20
    "
    >
      <span className="flex items-center gap-2.5 truncate">
        <FileSpreadsheet size={15} className="shrink-0 text-apple-ink-muted-48" />
        <span className="truncate text-body text-apple-ink">{name}</span>
      </span>
      <button
        onClick={onRemove}
        className="
          flex size-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-all
          group-hover:opacity-100
          hover:bg-apple-hairline/40
          active:scale-95
        "
      >
        <Trash2 size={13} className="text-apple-ink-muted-48" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText size={30} className="mb-3 text-apple-body-muted" />
      <p className="text-caption text-apple-ink-muted-48">暂无文件</p>
      <p className="mt-0.5 text-fine-print text-apple-body-muted">点击下方按钮添加 Excel / CSV 文件</p>
    </div>
  );
}

export function FileListSidebar({ files, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="
      flex w-full shrink-0 flex-col border-b border-apple-hairline/40 bg-apple-canvas-parchment
      lg:w-64 lg:border-r lg:border-b-0
    "
    >
      {/* — Header — */}
      <div className="flex items-center justify-between border-b border-apple-hairline/20 px-5 py-3.5">
        <h2 className="flex items-center gap-2 text-caption-strong tracking-widest text-apple-ink-muted-48 uppercase">
          <FolderOpen size={14} />
          文件列表
        </h2>
        <span className="text-fine-print text-apple-body-muted">
          {files.length}
          {' '}
          个
        </span>
      </div>

      {/* — File list — */}
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
        {files.length === 0
          ? <EmptyState />
          : files.map(f => (
              <FileItem key={f.id} name={f.name} onRemove={() => onRemove(f.id)} />
            ))}
      </div>

      {/* — Add button — */}
      <div className="border-t border-apple-hairline/20 px-4 py-3.5">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={e => onAdd(e.target.files)}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-secondary-pill w-full justify-center py-2.5"
        >
          <Upload size={14} />
          添加文件
        </button>
      </div>
    </aside>
  );
}
