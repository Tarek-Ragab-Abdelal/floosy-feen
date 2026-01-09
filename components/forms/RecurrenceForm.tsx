'use client';

import React, { useState } from 'react';
import { useRepositories } from '@/contexts/RepositoryContext';
import { Stream, TransactionType, RecurrenceFrequency, Recurrence } from '@/types/domain';
import { format } from 'date-fns';

interface RecurrenceFormProps {
  streams: Stream[];
  onSuccess: () => void;
  onCancel: () => void;
  initial?: Recurrence | null;
}

export function RecurrenceForm({ streams, onSuccess, onCancel, initial = null }: Readonly<RecurrenceFormProps>) {
  const { recurrenceRepo } = useRepositories();
  
  const [type, setType] = useState<TransactionType>(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '');
  const [streamId, setStreamId] = useState(initial?.streamId || streams[0]?.id || '');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(initial?.frequency || 'monthly');
  const [customIntervalDays, setCustomIntervalDays] = useState(initial?.customIntervalDays != null ? String(initial.customIntervalDays) : '');
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth != null ? String(initial.dayOfMonth) : '');
  const [startDate, setStartDate] = useState(format(initial?.startDate || new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initial?.endDate ? format(initial.endDate, 'yyyy-MM-dd') : '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedStream = streams.find(s => s.id === streamId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (frequency === 'custom' && (!customIntervalDays || parseInt(customIntervalDays) <= 0)) {
      alert('Please enter a valid custom interval');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initial && initial.id) {
        await recurrenceRepo.update(initial.id, {
          type,
          amount: parseFloat(amount),
          streamId,
          frequency,
          customIntervalDays: frequency === 'custom' ? parseInt(customIntervalDays) : undefined,
          dayOfMonth: frequency === 'monthly' && dayOfMonth ? parseInt(dayOfMonth) : undefined,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          description: description.trim() || undefined,
        });
      } else {
        await recurrenceRepo.create({
          type,
          amount: parseFloat(amount),
          streamId,
          frequency,
          customIntervalDays: frequency === 'custom' ? parseInt(customIntervalDays) : undefined,
          dayOfMonth: frequency === 'monthly' && dayOfMonth ? parseInt(dayOfMonth) : undefined,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          description: description.trim() || undefined,
          tags: [],
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving recurrence:', error);
      alert('Failed to save recurrence. Please try again.');
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
            className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

      {/* Frequency */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Frequency
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Interval</option>
        </select>
      </div>

      {/* Custom Interval */}
      {frequency === 'custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Custom Interval (Days)
          </label>
          <input
            type="number"
            value={customIntervalDays}
            onChange={(e) => setCustomIntervalDays(e.target.value)}
            placeholder="e.g., 14 for bi-weekly"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>
      )}

      {/* Day of Month for monthly frequency */}
      {frequency === 'monthly' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Day of Month (Optional)
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            placeholder="e.g., 25"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">If set, recurrence will trigger on this day each month.</p>
        </div>
      )}

      {/* Start Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          End Date (Optional)
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Leave empty for endless recurrence
        </p>
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
          placeholder="e.g., Monthly salary"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
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
          {isSubmitting ? (initial ? 'Saving...' : 'Creating...') : (initial ? 'Save Recurrence' : 'Create Recurrence')}
        </button>
      </div>
    </form>
  );
}
