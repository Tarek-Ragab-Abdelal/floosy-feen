'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { useDate } from '@/contexts/DateContext';
import { Modal } from '@/components/ui/Modal';
import { StreamForm } from '@/components/forms/StreamForm';
import { calculateStreamBalance } from '@/lib/calculations/balance';
import { Stream, Transaction } from '@/types/domain';
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export default function StreamsPage() {
  const { streamRepo, transactionRepo, isInitialized } = useRepositories();
  const { selectedDate } = useDate();
  
  const [streams, setStreams] = useState<Stream[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized, selectedDate]);

  const loadData = async () => {
    console.log('StreamsPage.loadData start');
    try {
      const [strms, txs] = await Promise.all([
        streamRepo.findActive(),
        transactionRepo.findAll(),
      ]);
      console.log(`StreamsPage.loadData - loaded ${strms.length} streams, ${txs.length} transactions`);

      setStreams(strms);
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamCreated = () => {
    setIsModalOpen(false);
    loadData();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <Wallet className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading streams...</p>
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
              Streams
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your income and expense sources
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Stream</span>
          </button>
        </div>

        {/* Streams Grid */}
        {streams.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No streams yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first stream to start tracking your finances
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
            >
              Create Stream
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map(stream => {
              const balance = calculateStreamBalance(transactions, stream.id, selectedDate);
              const isPositive = balance >= 0;

              return (
                <div
                  key={stream.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {stream.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 capitalize">
                        {stream.icon === 'card' ? 'Credit Card' : (stream.icon || 'Account')}
                      </span>
                      {stream.creditLimit && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                             Limit: {stream.baseCurrency} {stream.creditLimit.toLocaleString()}
                          </div>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      isPositive
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stream.baseCurrency}
                      </span>
                      <span className={`text-3xl font-bold ${
                        isPositive
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      As of {selectedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Stream Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Stream"
      >
        <StreamForm
          onSuccess={handleStreamCreated}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </AppLayout>
  );
}
