// IndexedDB Schema Definition

export const DB_NAME = 'FinanceVaultDB';
export const DB_VERSION = 1;

export const STORES = {
  STREAMS: 'streams',
  TRANSACTIONS: 'transactions',
  RECURRENCES: 'recurrences',
  TAGS: 'tags',
  SETTINGS: 'settings',
  EXCHANGE_RATES: 'exchange_rates',
  AUTOMATIONS: 'automations',
} as const;

export interface DBSchema {
  streams: {
    key: string;
    value: {
      id: string;
      name: string;
      // type: 'income' | 'expense' | 'account';
      icon: string;
      baseCurrency: string;
      creditLimit?: number;
      currentUsage?: number;
      createdAt: string;
      archivedAt: string | null;
    };
    indexes: {
      // 'by-type': string;
      'by-archived': string | null;
    };
  };
  transactions: {
    key: string;
    value: {
      id: string;
      streamId: string;
      amount: number;
      currency: string;
      applicabilityDate: string;
      createdAt: string;
      type: 'income' | 'expense';
      tags: string[];
      recurrenceId: string | null;
      description?: string;
    };
    indexes: {
      'by-stream': string;
      'by-applicability-date': string;
      'by-type': string;
      'by-recurrence': string | null;
    };
  };
  recurrences: {
    key: string;
    value: {
      id: string;
      streamId: string;
      amount: number;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
      customIntervalDays?: number;
      dayOfMonth?: number;
      startDate: string;
      endDate: string | null;
      type: 'income' | 'expense';
      description?: string;
      tags: string[];
    };
    indexes: {
      'by-stream': string;
      'by-type': string;
    };
  };
  tags: {
    key: string;
    value: {
      id: string;
      name: string;
      createdAt: string;
    };
    indexes: {
      'by-name': string;
    };
  };
  settings: {
    key: string;
    value: {
      id: string;
      name: string;
      primaryCurrency: string;
      isFirstLaunch: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  exchange_rates: {
    key: string;
    value: {
      id: string;
      fromCurrency: string;
      toCurrency: string;
      rate: number;
      date: string;
      fetchedAt: string;
    };
    indexes: {
      'by-currencies': string;
      'by-date': string;
    };
  };
  automations: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      amount: number;
      currency: string;
      sourceStreamId?: string;
      targetStreamId?: string;
      schedule: {
        frequency: string;
        day?: number | null;
      };
      isActive: boolean;
      createdAt: string;
      lastRunAt: string | undefined;
    };
    indexes: {
      'by-active': boolean;
    };
  };
}
