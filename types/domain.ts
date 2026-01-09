// Domain Types for Personal Finance Vault

// export type StreamType = 'income' | 'expense' | 'account'; // Deprecated
export type TransactionType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Stream {
  id: string;
  name: string;
  // type: StreamType; // Removed in favor of unified Account concept
  icon: string; // 'bank', 'cash', 'card', 'paypal', etc.
  baseCurrency: string;
  creditLimit?: number; // For Credit Cards
  currentUsage?: number; // For Credit Cards
  createdAt: Date;
  archivedAt: Date | null;
}

export interface Transaction {
  id: string;
  streamId: string;
  amount: number;
  currency: string;
  applicabilityDate: Date;
  createdAt: Date;
  type: TransactionType;
  tags: string[];
  recurrenceId: string | null;
  description?: string;
}

export interface Recurrence {
  id: string;
  streamId: string;
  amount: number;
  frequency: RecurrenceFrequency;
  customIntervalDays?: number; // For custom frequency
  dayOfMonth?: number; // Optional explicit day of month for monthly recurrences
  startDate: Date;
  endDate: Date | null;
  type: TransactionType;
  description?: string;
  tags: string[];
}

export type AutomationType = 'salary' | 'transfer' | 'saving_circle' | 'cc_payment'; // New types

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  amount: number; // or calculate locally if 'ALL'
  // Currency is optional; when omitted the automation will use associated stream's baseCurrency
  currency?: string;
  sourceStreamId?: string; // For transfer/cc
  targetStreamId?: string; // For salary/transfer
  schedule: {
    frequency: 'monthly' | 'weekly' | 'manual';
    day?: number; // e.g. 6th of month
  };
  isActive: boolean;
  createdAt: Date;
  lastRunAt?: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface UserSettings {
  id: string; // Always '1' for single user
  name: string;
  primaryCurrency: string;
  isFirstLaunch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Exchange rate cache
export interface ExchangeRateCache {
  id: string; // Format: "USD_EUR_2025-12-22"
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string; // YYYY-MM-DD
  fetchedAt: Date;
}

// Common currencies
export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '⃁' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
] as const;

export type CurrencyCode = typeof COMMON_CURRENCIES[number]['code'];
