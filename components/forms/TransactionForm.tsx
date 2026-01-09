'use client';

import React, { useState } from 'react';
import { useRepositories } from '@/contexts/RepositoryContext';
import { Stream, TransactionType, Transaction } from '@/types/domain';
import { format } from 'date-fns';

interface TransactionFormProps {
  streams: Stream[];
  onSuccess: () => void;
  onCancel: () => void;
  initial?: Transaction | null;
}

export function TransactionForm({ streams, onSuccess, onCancel, initial = null }: TransactionFormProps) {
  const { transactionRepo, tagRepo } = useRepositories();
  
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '');
  const [streamId, setStreamId] = useState(initial?.streamId || streams[0]?.id || '');
  const [applicabilityDate, setApplicabilityDate] = useState(format(initial?.applicabilityDate || new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState(initial?.description || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStream = streams.find(s => s.id === streamId);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!streamId) {
      alert('Please select a stream');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create tags if they don't exist (we keep tag names)
      await Promise.all(tags.map(tagName => tagRepo.findOrCreate(tagName)));

      if (initial && initial.id) {
        await transactionRepo.update(initial.id, {
          type,
          amount: parseFloat(amount),
          streamId,
          currency: selectedStream?.baseCurrency || 'USD',
          applicabilityDate: new Date(applicabilityDate),
          tags,
          description: description.trim() || undefined,
        });
      } else {
        await transactionRepo.create({
          type,
          amount: parseFloat(amount),
          streamId,
          currency: selectedStream?.baseCurrency || 'USD',
          applicabilityDate: new Date(applicabilityDate),
          tags,
          description: description.trim() || undefined,
          recurrenceId: null,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              type === 'income'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 ring-2 ring-green-500'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              type === 'expense'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 ring-2 ring-red-500'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {selectedStream?.baseCurrency || 'USD'}
          </span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Stream */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Stream
        </label>
        <select
          value={streamId}
          onChange={(e) => setStreamId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          {streams.map(stream => (
            <option key={stream.id} value={stream.id}>
              {stream.name} ({stream.baseCurrency})
            </option>
          ))}
        </select>
      </div>

      {/* Applicability Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Applicability Date
        </label>
        <input
          type="date"
          value={applicabilityDate}
          onChange={(e) => setApplicabilityDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Grocery shopping"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag"
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-lg font-medium hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-emerald-900 dark:hover:text-emerald-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (initial ? 'Saving...' : 'Creating...') : (initial ? 'Save Transaction' : 'Create Transaction')}
        </button>
      </div>
    </form>
  );
}
