// Domain Types for Personal Floosy Feen
export type TransactionType = 'income' | 'expense';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface Stream {
  id: string;
  name: string;
  icon: string; 
  baseCurrency: string;
  isCreditCard?: boolean; // Indicates if this is a credit card stream
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

export type AutomationType = 'salary' | 'transfer' | 'saving_circle' | 'cc_payment' | 'installment'; // Added installment

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  amount: number; // or calculate locally if 'ALL'
  // Currency is optional; when omitted the automation will use associated stream's baseCurrency
  currency?: string;
  sourceStreamId?: string; // For transfer/cc/saving_circle
  targetStreamId?: string; // For salary/transfer
  schedule: {
    frequency: 'monthly' | 'weekly' | 'manual';
    day?: number; // e.g. 6th of month
    startDate?: Date; // When to start the automation
    endDate?: Date | null; // When to end (null = indefinite)
    occurrences?: number; // For installments - total number of times to run
  };
  // For saving circles with earning months
  savingCircle?: {
    totalOccurrences: number; // Total payments (e.g., 12 months)
    earningSchedule?: Array<{
      occurrence: number; // Which occurrence (1-based, e.g., 2 for 2nd month)
      portion: number; // Portion to earn (0-1, e.g., 0.33 for 4/12)
    }>;
  };
  isActive: boolean;
  requiresConfirmation: boolean; // If true, user must manually confirm each occurrence
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
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
] as const;

export type CurrencyCode = typeof COMMON_CURRENCIES[number]['code'];
