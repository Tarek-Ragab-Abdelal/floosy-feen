import React from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Stream, Transaction } from '@/types/domain';
import { StreamCard } from './StreamCard';

interface StreamsSectionProps {
  streams: Stream[];
  transactions: Transaction[];
  selectedDate: Date;
  onCreateStream: () => void;
  onDeleteStream?: (streamId: string, transferToStreamId?: string) => void;
  onEditStream?: (stream: Stream) => void;
}

export function StreamsSection({ streams, transactions, selectedDate, onCreateStream, onDeleteStream, onEditStream }: Readonly<StreamsSectionProps>) {
  // Sort streams by most recent transaction
  const sortedStreams = React.useMemo(() => {
    return [...streams].sort((a, b) => {
      const aTransactions = transactions.filter(tx => tx.streamId === a.id);
      const bTransactions = transactions.filter(tx => tx.streamId === b.id);
      
      // Use createdAt (actual time of transaction) for more accurate sorting
      const aLatest = aTransactions.length > 0 
        ? Math.max(...aTransactions.map(tx => new Date(tx.createdAt).getTime()))
        : a.createdAt.getTime();
      const bLatest = bTransactions.length > 0 
        ? Math.max(...bTransactions.map(tx => new Date(tx.createdAt).getTime()))
        : b.createdAt.getTime();
      
      // Sort descending (most recent first)
      return bLatest - aLatest;
    });
  }, [streams, transactions]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Streams
        </h2>
        <button
          onClick={onCreateStream}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Create Stream</span>
        </button>
      </div>
      
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
            onClick={onCreateStream}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
          >
            Create Your First Stream
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedStreams.map(stream => {
            // Calculate stream balance
            let streamBalance = transactions
              .filter(tx => tx.streamId === stream.id && tx.applicabilityDate <= selectedDate)
              .reduce((sum, tx) => tx.type === 'income' ? sum + tx.amount : sum - tx.amount, 0);
            
            // For credit cards, show available credit (limit - usage)
            if (stream.isCreditCard && stream.creditLimit) {
              // Calculate usage from transactions (expenses increase usage, payments/income decrease it)
              const transactionUsage = transactions
                .filter(tx => tx.streamId === stream.id && tx.applicabilityDate <= selectedDate)
                .reduce((sum, tx) => tx.type === 'expense' ? sum + tx.amount : sum - tx.amount, 0);
              
              const totalUsage = (stream.currentUsage || 0) + transactionUsage;
              streamBalance = stream.creditLimit - totalUsage; // Show available credit
            }

            return (
              <StreamCard
                key={stream.id}
                stream={stream}
                balance={streamBalance}
                selectedDate={selectedDate}
                onDelete={onDeleteStream}
                onEdit={onEditStream}
                availableStreams={streams}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
