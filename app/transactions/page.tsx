'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { useDate } from '@/contexts/DateContext';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionSummary } from '@/components/transactions/TransactionSummary';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Stream, Transaction, UserSettings } from '@/types/domain';
import { Plus, Wallet } from 'lucide-react';
import { fetchAndCacheRatesForCurrencies } from '@/lib/currency/converter';

const TRANSACTIONS_PER_PAGE = 10;

export default function TransactionsPage() {
  const { streamRepo, transactionRepo, settingsRepo, isInitialized } = useRepositories();
  const { selectedDate } = useDate();
  
  const [streams, setStreams] = useState<Stream[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [exchangeRates, setExchangeRates] = useState<Map<string, number>>(new Map());
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStream, setFilterStream] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [displayCount, setDisplayCount] = useState(TRANSACTIONS_PER_PAGE);

  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized, selectedDate]);

  const loadData = async () => {
    console.log('TransactionsPage.loadData start');
    try {
      const [strms, txs, stgs] = await Promise.all([
        streamRepo.findActive(),
        transactionRepo.findAll(),
        settingsRepo.get(),
      ]);
      console.log(`TransactionsPage.loadData - loaded ${strms.length} streams, ${txs.length} transactions`);

      setStreams(strms);
      setTransactions(txs);
      setSettings(stgs);

      // Fetch exchange rates for all currencies in use
      if (stgs?.primaryCurrency) {
        const streamCurrencies = strms.map(s => s.baseCurrency);
        const txCurrencies = txs.map(t => t.currency);
        const allCurrencies = Array.from(new Set([...streamCurrencies, ...txCurrencies]));
        
        try {
          const rates = await fetchAndCacheRatesForCurrencies(stgs.primaryCurrency, allCurrencies);
          setExchangeRates(rates);
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
          setExchangeRates(new Map());
        }
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionCreated = () => {
    setIsTransactionModalOpen(false);
    loadData();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionRepo.delete(transactionId);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  const handleAddTransaction = () => {
    if (streams.length === 0) {
      alert('Please create a stream first');
      return;
    }
    setIsTransactionModalOpen(true);
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + TRANSACTIONS_PER_PAGE);
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => tx.applicabilityDate <= selectedDate)
      .filter(tx => filterType === 'all' || tx.type === filterType)
      .filter(tx => filterStream === 'all' || tx.streamId === filterStream)
      .filter(tx => {
        if (dateFrom && tx.applicabilityDate < dateFrom) return false;
        if (dateTo) {
          const dateToEndOfDay = new Date(dateTo);
          dateToEndOfDay.setHours(23, 59, 59, 999);
          if (tx.applicabilityDate > dateToEndOfDay) return false;
        }
        return true;
      })
      .sort((a, b) => b.applicabilityDate.getTime() - a.applicabilityDate.getTime());
  }, [transactions, selectedDate, filterType, filterStream, dateFrom, dateTo]);

  // Paginate transactions
  const displayedTransactions = filteredTransactions.slice(0, displayCount);
  const hasMore = displayCount < filteredTransactions.length;

  // Calculate summary stats with currency conversion
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => {
      let amount = tx.amount;
      
      // Convert to primary currency if needed
      if (settings?.primaryCurrency && tx.currency !== settings.primaryCurrency && exchangeRates) {
        const directKey = `${tx.currency}_${settings.primaryCurrency}`;
        const inverseKey = `${settings.primaryCurrency}_${tx.currency}`;
        
        if (exchangeRates.has(directKey)) {
          amount *= exchangeRates.get(directKey)!;
        } else if (exchangeRates.has(inverseKey)) {
          amount /= exchangeRates.get(inverseKey)!;
        }
      }
      
      return sum + amount;
    }, 0);
  
  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => {
      let amount = tx.amount;
      
      // Convert to primary currency if needed
      if (settings?.primaryCurrency && tx.currency !== settings.primaryCurrency && exchangeRates) {
        const directKey = `${tx.currency}_${settings.primaryCurrency}`;
        const inverseKey = `${settings.primaryCurrency}_${tx.currency}`;
        
        if (exchangeRates.has(directKey)) {
          amount *= exchangeRates.get(directKey)!;
        } else if (exchangeRates.has(inverseKey)) {
          amount /= exchangeRates.get(inverseKey)!;
        }
      }
      
      return sum + amount;
    }, 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <Wallet className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Transactions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all your transactions
            </p>
          </div>
          <button
            onClick={handleAddTransaction}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Transaction</span>
          </button>
        </div>

        {/* Filters */}
        <TransactionFilters
          filterType={filterType}
          filterStream={filterStream}
          dateFrom={dateFrom}
          dateTo={dateTo}
          showFilters={showFilters}
          streams={streams}
          onFilterTypeChange={setFilterType}
          onFilterStreamChange={setFilterStream}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Summary Stats */}
        {filteredTransactions.length > 0 && (
          <TransactionSummary
            totalTransactions={filteredTransactions.length}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            currency={settings?.primaryCurrency}
          />
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={displayedTransactions}
          streams={streams}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onDelete={handleDeleteTransaction}
          onAddTransaction={transactions.length === 0 ? handleAddTransaction : undefined}
        />
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="New Transaction"
      >
        <TransactionForm
          streams={streams}
          onSuccess={handleTransactionCreated}
          onCancel={() => setIsTransactionModalOpen(false)}
        />
      </Modal>
    </AppLayout>
  );
}
