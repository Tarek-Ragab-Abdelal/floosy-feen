import React from 'react';
import { TrendingDown } from 'lucide-react';
import { Transaction, Stream } from '@/types/domain';
import { TransactionCard } from './TransactionCard';

interface TransactionListProps {
  transactions: Transaction[];
  streams: Stream[];
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete?: (transactionId: string) => void;
  onAddTransaction?: () => void;
}

export function TransactionList({
  transactions,
  streams,
  hasMore,
  onLoadMore,
  onDelete,
  onAddTransaction,
}: Readonly<TransactionListProps>) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
        <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No transactions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add your first transaction to start tracking your finances
        </p>
        {onAddTransaction && (
          <button
            onClick={onAddTransaction}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            Add Transaction
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const stream = streams.find(s => s.id === transaction.streamId);
            return (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                stream={stream}
                onDelete={onDelete}
              />
            );
          })}
      </div>
      
      {/* Load More / End of List */}
      <div className="text-center">
        {hasMore ? (
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all"
          >
            Load More
          </button>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
            End of transactions
          </p>
        )}
      </div>
    </div>
  );
}
