'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { useDate } from '@/contexts/DateContext';
import { DateSelector } from '@/components/ui/DateSelector';
import { FAB } from '@/components/ui/FAB';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { calculateMoneyInHand, calculateProjectedMoney } from '@/lib/calculations/balance';
import { Transaction, Stream, UserSettings } from '@/types/domain';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { transactionRepo, streamRepo, settingsRepo, isInitialized } = useRepositories();
  const { selectedDate } = useDate();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    loadData();
  }, [isInitialized, selectedDate]);

  // const [rates, setRates] = useState<Map<string, number>>(new Map()); // Not efficient to strictly state map type in hook if strict mode
  const [exchangeRates, setExchangeRates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isInitialized) return;

    loadData();
  }, [isInitialized, selectedDate]);

  const loadData = async () => {
    try {
      const [txs, strms, stgs, ratesList] = await Promise.all([
        transactionRepo.findAll(),
        streamRepo.findActive(),
        settingsRepo.get(),
        // We really want only latest rates, but for now getting all and filtering in memory or just using all is fine if ID is unique per day
        // Ideally we need a map Key: "FROM_TO" -> Rate. 
        // We'll need to fetch latest rates for each currency pair related to user's primary currency.
        // For simplicity, let's fetch all and map them locally.
        import('@/repositories/exchange-rate.repository').then(m => m.exchangeRateRepo.findAll()),
      ]);

      setTransactions(txs);
      setStreams(strms);
      setSettings(stgs);

      // Process rates into a Map
      // We want the LATEST rate for each pair.
      // id format: "USD_EUR_2025-12-22"
      // We can just sort by date and stick in map.
      const rateMap = new Map<string, number>();
      // Sort by date ascending so latest overwrites earlier
      const sortedRates = ratesList.sort((a, b) => a.date.localeCompare(b.date));
      
      sortedRates.forEach(r => {
        rateMap.set(`${r.fromCurrency}_${r.toCurrency}`, r.rate);
      });
      setExchangeRates(rateMap);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionCreated = () => {
    setIsTransactionModalOpen(false);
    loadData();
  };

  const handleFABClick = () => {
    if (streams.length === 0) {
      alert('Please create a stream first from the Streams page');
      return;
    }
    setIsTransactionModalOpen(true);
  };

  const moneyInHand = calculateMoneyInHand(transactions, selectedDate, settings?.primaryCurrency, exchangeRates);
  const projectedMoney = calculateProjectedMoney(transactions, selectedDate, settings?.primaryCurrency, exchangeRates);
  const totalBalance = moneyInHand + projectedMoney;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {settings?.name || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>

          <DateSelector/>
        </div>

        {/* Hero Card - Money in Hand */}
        <div className="relative overflow-hidden bg-emerald-600 rounded-3xl shadow-xl p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 opacity-90" />
              <span className="text-sm font-medium opacity-90">Money in Hand</span>
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 break-words">
              {settings?.primaryCurrency} {moneyInHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Projected: {settings?.primaryCurrency} {projectedMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Balance</span>
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {settings?.primaryCurrency} {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Streams</span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {streams.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Transactions</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactions.filter(tx => tx.applicabilityDate <= selectedDate).length}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Transactions
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Click the + button to add your first transaction
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions
                .filter(tx => tx.applicabilityDate <= selectedDate)
                .sort((a, b) => b.applicabilityDate.getTime() - a.applicabilityDate.getTime())
                .slice(0, 5)
                .map((tx) => {
                  const stream = streams.find(s => s.id === tx.streamId);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {stream?.name || 'Unknown'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tx.type === 'income'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {tx.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {format(tx.applicabilityDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className={`text-lg font-semibold ${
                        tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.currency} {tx.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <FAB onClick={handleFABClick} label="Add Transaction" />

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
