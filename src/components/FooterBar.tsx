import type { ExportFormat } from '@/types';
import { LoaderCircle, Play } from 'lucide-react';
import { FORMAT_CONFIG, FORMATS } from '@/types';

interface Props {
  fileCount: number;
  format: ExportFormat;
  onFormatChange: (f: ExportFormat) => void;
  isExtracting: boolean;
  canExtract: boolean;
  onExtract: () => void;
}

export function FooterBar({ fileCount, format, onFormatChange, isExtracting, canExtract, onExtract }: Props) {
  return (
    <div className="
      shrink-0 border-t border-apple-hairline/20 bg-apple-canvas-parchment/80 px-6 py-3.5 backdrop-blur-2xl
      backdrop-saturate-150
    "
    >
      <div className="flex items-center justify-end gap-4">
        {/* — File count — */}
        {fileCount > 0 && (
          <p className="hidden shrink-0 text-fine-print text-apple-ink-muted-48 sm:block">
            共
            {' '}
            <span className="font-medium text-apple-ink-muted-80">{fileCount}</span>
            {' '}
            个文件
          </p>
        )}

        {/* — Spacer — */}
        <div className="flex-1" />

        {/* — Format selector — */}
        <div className="relative">
          <select
            value={format}
            onChange={e => onFormatChange(e.target.value as ExportFormat)}
            className="
              h-[36px] appearance-none rounded-full border border-apple-hairline bg-apple-canvas pr-8 pl-4 text-caption
              text-apple-ink-muted-80 transition-all duration-150 outline-none
              hover:border-apple-ink-muted-48/40
              focus:border-apple-primary focus:shadow-[0_0_0_3px] focus:shadow-apple-primary/15
            "
          >
            {FORMATS.map(f => (
              <option key={f} value={f}>{FORMAT_CONFIG[f].label}</option>
            ))}
          </select>
          {/* — Chevron — */}
          <svg
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-apple-ink-muted-48"
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
          >
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* — Primary CTA — */}
        <button
          disabled={!canExtract || isExtracting}
          onClick={onExtract}
          className="btn-primary"
        >
          {isExtracting
            ? (
                <LoaderCircle size={16} className="animate-spin" />
              )
            : (
                <Play size={14} />
              )}
          {isExtracting ? '提取中...' : '开始提取'}
        </button>
      </div>
    </div>
  );
}
