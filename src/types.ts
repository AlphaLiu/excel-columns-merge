import type { BookType } from 'xlsx';

export interface ExcelFile {
  id: string;
  name: string;
  file: File;
}

export type ExportFormat = 'xlsx' | 'xls' | 'csv' | 'ods';

export interface FormatConfig {
  label: string;
  extension: string;
  bookType: BookType;
  filter: { name: string; extensions: string[] };
}

export const FORMAT_CONFIG: Record<ExportFormat, FormatConfig> = {
  xlsx: { label: 'Excel 工作簿 (.xlsx)', extension: '.xlsx', bookType: 'xlsx', filter: { name: 'Excel 工作簿', extensions: ['xlsx'] } },
  xls: { label: 'Excel 97-2003 (.xls)', extension: '.xls', bookType: 'biff8', filter: { name: 'Excel 97-2003 工作簿', extensions: ['xls'] } },
  csv: { label: 'CSV 文件 (.csv)', extension: '.csv', bookType: 'csv', filter: { name: 'CSV 文件', extensions: ['csv'] } },
  ods: { label: 'ODS 电子表格 (.ods)', extension: '.ods', bookType: 'ods', filter: { name: 'OpenDocument 电子表格', extensions: ['ods'] } },
};

export const FORMATS = Object.keys(FORMAT_CONFIG) as ExportFormat[];
