import type { ExcelFile, ExportFormat } from '@/types';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { FORMAT_CONFIG } from '@/types';

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`FileReader error: ${reader.error}`));
    reader.readAsArrayBuffer(file);
  });
}

function extractColumns(
  jsonData: Record<string, string>[],
  headers: string[],
): Record<string, string>[] {
  return jsonData.map((row) => {
    const extracted: Record<string, string> = {};
    for (const header of headers) {
      const key = Object.keys(row).find(
        k => k === header || k.toLowerCase() === header.toLowerCase(),
      );
      extracted[header] = key ? String(row[key] ?? '') : '';
    }
    return extracted;
  });
}

function isExcelFile(name: string) {
  return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv');
}

export function useExcelExtract() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [targetHeaders, setTargetHeaders] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('xlsx');

  const handleFileAdd = useCallback((fileList: FileList | null) => {
    if (!fileList)
      return;
    const newFiles: ExcelFile[] = Array.from(fileList)
      .filter(f => isExcelFile(f.name))
      .map(f => ({
        id: Math.random().toString(36).slice(2),
        name: f.name,
        file: f,
      }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const canExtract = files.length > 0 && targetHeaders.length > 0;

  const handleExtract = useCallback(async () => {
    setIsExtracting(true);
    try {
      const fmt = FORMAT_CONFIG[format];
      const savePath = await save({
        defaultPath: `合并结果${fmt.extension}`,
        filters: [fmt.filter],
      });
      if (!savePath) {
        setIsExtracting(false);
        return;
      }

      const allRows: Record<string, string>[] = [];

      for (const { file } of files) {
        const buf = await readFileAsArrayBuffer(file);
        const workbook = XLSX.read(new Uint8Array(buf), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        allRows.push(...extractColumns(jsonData, targetHeaders));
      }

      if (allRows.length === 0) {
        toast.error('没有提取到任何数据，请检查列标题是否匹配');
        return;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allRows), '合并结果');
      const out = XLSX.write(wb, { bookType: fmt.bookType, type: 'array' });
      await writeFile(savePath, new Uint8Array(out as ArrayBuffer));

      toast.success(`已保存到 ${savePath}`);
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Extraction error:', msg);
      toast.error(`提取失败：${msg}`);
    }
    finally {
      setIsExtracting(false);
    }
  }, [files, targetHeaders, format]);

  return {
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
  };
}
