// Data Export Utilities

import { format } from 'date-fns';
import { Stream, Transaction, Recurrence, Tag, UserSettings } from '@/types/domain';

export interface ExportData {
  exportDate: string;
  dateRange: {
    from: string;
    to: string;
  };
  settings: UserSettings | null;
  streams: Stream[];
  transactions: Transaction[];
  recurrences: Recurrence[];
  tags: Tag[];
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  transactions: Transaction[],
  streams: Stream[],
  dateRange: { from: Date; to: Date }
): string {
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Currency',
    'Stream',
    'Description',
    'Tags',
    'Created At',
  ];

  const rows = transactions.map(tx => {
    const stream = streams.find(s => s.id === tx.streamId);
    return [
      format(tx.applicabilityDate, 'yyyy-MM-dd'),
      tx.type,
      tx.amount.toString(),
      tx.currency,
      stream?.name || 'Unknown',
      tx.description || '',
      tx.tags.join('; '),
      format(tx.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export complete data to JSON format (for backup/migration)
 */
export function exportToJSON(
  data: ExportData
): string {
  // Convert dates to ISO strings for JSON serialization
  const serializable = {
    ...data,
    settings: data.settings ? {
      ...data.settings,
      createdAt: data.settings.createdAt.toISOString(),
      updatedAt: data.settings.updatedAt.toISOString(),
    } : null,
    streams: data.streams.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      archivedAt: s.archivedAt ? s.archivedAt.toISOString() : null,
    })),
    transactions: data.transactions.map(t => ({
      ...t,
      applicabilityDate: t.applicabilityDate.toISOString(),
      createdAt: t.createdAt.toISOString(),
    })),
    recurrences: data.recurrences.map(r => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate ? r.endDate.toISOString() : null,
    })),
    tags: data.tags.map(tag => ({
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    })),
  };

  return JSON.stringify(serializable, null, 2);
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export transactions as CSV and download
 */
export function downloadCSV(
  transactions: Transaction[],
  streams: Stream[],
  dateRange: { from: Date; to: Date }
): void {
  const csv = exportToCSV(transactions, streams, dateRange);
  const filename = `finance-vault-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export complete data as JSON and download
 */
export function downloadJSON(data: ExportData): void {
  const json = exportToJSON(data);
  const filename = `finance-vault-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(json, filename, 'application/json');
}
