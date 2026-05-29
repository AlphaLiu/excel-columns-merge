import { FileSpreadsheet } from 'lucide-react';
import { TagInput } from '@/components/TagInput';

function InfoTip({ fileCount }: { fileCount: number }) {
  if (fileCount === 0) {
    return (
      <div className="flex items-center gap-2.5 px-1">
        <span className="size-1.5 rounded-full bg-apple-primary" />
        <p className="text-caption text-apple-ink-muted-48">
          请先在左侧添加 Excel 文件
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-1">
      <FileSpreadsheet size={16} className="shrink-0 text-apple-primary" />
      <p className="text-caption text-apple-ink-muted-48">
        已添加
        {' '}
        <span className="font-medium text-apple-primary">{fileCount}</span>
        {' '}
        个文件，输入要提取的列标题后即可开始
      </p>
    </div>
  );
}

function HeaderTagList({ headers }: { headers: string[] }) {
  if (headers.length === 0)
    return null;
  return (
    <div className="flex items-center gap-2 text-fine-print text-apple-ink-muted-48">
      <span>
        已添加
        {' '}
        <span className="font-medium text-apple-primary">{headers.length}</span>
        {' '}
        个列标题：
      </span>
      <span className="font-medium text-apple-ink-muted-80">
        {headers.join('、')}
      </span>
    </div>
  );
}

interface Props {
  fileCount: number;
  headers: string[];
  onHeadersChange: (headers: string[]) => void;
}

export function ExtractPanel({ fileCount, headers, onHeadersChange }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-apple-canvas">
      <div className="flex-1 space-y-6 overflow-y-auto p-8">
        {/* — Info tip — */}
        <InfoTip fileCount={fileCount} />

        {/* — Column headers card — */}
        <section className="space-y-5 rounded-lg border border-apple-hairline/30 bg-apple-surface-pearl px-6 py-7">
          <h3 className="flex items-center gap-3 text-caption-strong tracking-wider text-apple-ink-muted-48 uppercase">
            <span className="size-2 rounded-full bg-apple-primary" />
            要提取的列标题
          </h3>

          <TagInput
            value={headers}
            onChange={onHeadersChange}
            placeholder="输入列标题，按回车添加（如：Contact E-mail）"
          />

          <HeaderTagList headers={headers} />
        </section>
      </div>
    </div>
  );
}
