import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Trash2, MoreVertical, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Stream } from '@/types/domain';

interface StreamCardProps {
  stream: Stream;
  balance: number;
  selectedDate: Date;
  onDelete?: (streamId: string, transferToStreamId?: string) => void;
  onEdit?: (stream: Stream) => void;
  availableStreams?: Stream[];
}

export function StreamCard({ stream, balance, selectedDate, onDelete, onEdit, availableStreams }: Readonly<StreamCardProps>) {
  const isPositive = balance >= 0;
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transferToStreamId, setTransferToStreamId] = useState<string>('');
  const [deleteAction, setDeleteAction] = useState<'remove' | 'transfer'>('remove');

  const otherStreams = availableStreams?.filter(s => s.id !== stream.id) || [];

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleEditClick = () => {
    setShowMenu(false);
    onEdit?.(stream);
  };

  const confirmDelete = () => {
    if (deleteAction === 'transfer' && !transferToStreamId) {
      alert('Please select a stream to transfer to');
      return;
    }
    onDelete?.(stream.id, deleteAction === 'transfer' ? transferToStreamId : undefined);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        {/* Header with Icon and Menu */}
        <div className="flex items-center justify-between mb-4">
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
          
          {(onDelete || onEdit) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Stream options"
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
                    {onEdit && (
                      <button
                        onClick={handleEditClick}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Stream
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Stream
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      
      {/* Stream Name and Type */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {stream.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 capitalize">
            {stream.icon === 'card' ? 'Credit Card' : (stream.icon || 'Account')}
          </span>
          {stream.creditLimit && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Limit: {stream.baseCurrency} {stream.creditLimit.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {stream.isCreditCard && stream.creditLimit ? (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Available Credit
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stream.baseCurrency}
              </span>
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              As of {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          </>
        ) : (
          <>
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
              As of {format(selectedDate, 'MMM dd, yyyy')}
            </p>
          </>
        )}
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Delete "{stream.name}"?
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            What would you like to do with the transactions in this stream?
          </p>

          <div className="space-y-3 mb-6">
            <span className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <input
                type="radio"
                name="deleteAction"
                value="remove"
                checked={deleteAction === 'remove'}
                onChange={() => setDeleteAction('remove')}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Remove Everything</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delete the stream and all its transactions permanently</div>
              </div>
            </span>

            {otherStreams.length > 0 && (
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="deleteAction"
                  value="transfer"
                  checked={deleteAction === 'transfer'}
                  onChange={() => setDeleteAction('transfer')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white mb-2">Transfer to Another Stream</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Move all transactions to another stream before deleting</div>
                  {deleteAction === 'transfer' && (
                    <select
                      value={transferToStreamId}
                      onChange={(e) => setTransferToStreamId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a stream...</option>
                      {otherStreams.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Stream
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
