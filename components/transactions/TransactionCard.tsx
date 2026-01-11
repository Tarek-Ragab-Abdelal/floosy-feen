import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, MoreVertical } from 'lucide-react';
import { Transaction, Stream } from '@/types/domain';

interface TransactionCardProps {
  transaction: Transaction;
  stream?: Stream;
  onDelete?: (transactionId: string) => void;
}

export function TransactionCard({ transaction, stream, onDelete }: Readonly<TransactionCardProps>) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this transaction? This will reverse its effect on the stream balance.`)) {
      onDelete?.(transaction.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {stream?.name || 'Unknown'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            transaction.type === 'income'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            {transaction.type}
          </span>
        </div>
        {transaction.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {transaction.description}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {format(transaction.applicabilityDate, 'MMM dd, yyyy')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <div className={`text-lg font-semibold ${
            transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {transaction.currency}
          </div>
        </div>
        {onDelete && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              aria-label="Transaction options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <>
                <button 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
