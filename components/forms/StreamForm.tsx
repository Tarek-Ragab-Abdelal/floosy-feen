'use client';

import React, { useState } from 'react';
import { Stream } from '@/types/domain';
import { useRepositories } from '@/contexts/RepositoryContext';
// import { StreamType } from '@/types/domain'; // Removed
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { Building2, Banknote, CreditCard, Wallet, Landmark, DollarSign, Euro, PoundSterling } from 'lucide-react';

const ICONS = [
  { id: 'bank', icon: Building2, label: 'Bank' },
  { id: 'cash', icon: Banknote, label: 'Cash' },
  { id: 'card', icon: CreditCard, label: 'Card' },
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
];

interface StreamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initial?: Stream | null;
}

export function StreamForm({ onSuccess, onCancel, initial = null }: StreamFormProps) {
  const { streamRepo } = useRepositories();
  
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || 'bank');
  // const [type, setType] = useState<StreamType>('account'); // Removed
  const [baseCurrency, setBaseCurrency] = useState(initial?.baseCurrency || 'USD');
  
  const [isCreditCard, setIsCreditCard] = useState(initial?.icon === 'card');
  const [creditLimit, setCreditLimit] = useState(initial?.creditLimit != null ? String(initial.creditLimit) : '');
  const [currentUsage, setCurrentUsage] = useState(initial?.currentUsage != null ? String(initial.currentUsage) : '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('StreamForm submitted', { name, icon, baseCurrency, isCreditCard, creditLimit, currentUsage });

    if (!name.trim()) {
      alert('Please enter a stream name');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initial && initial.id) {
        const updates: Partial<Stream> = {
          name: name.trim(),
          icon,
          baseCurrency: initial.baseCurrency, // baseCurrency cannot change
        };

        if (isCreditCard) {
          updates.creditLimit = parseFloat(creditLimit) || 0;
          updates.currentUsage = parseFloat(currentUsage) || 0;
        }

        await streamRepo.update(initial.id, updates);
      } else {
        await streamRepo.create({
          name: name.trim(),
          icon,
          baseCurrency,
          ...(isCreditCard ? {
            creditLimit: parseFloat(creditLimit) || 0,
            currentUsage: parseFloat(currentUsage) || 0,
          } : {}),
          creditLimit: isCreditCard ? parseFloat(creditLimit) || 0 : undefined,
          currentUsage: isCreditCard ? parseFloat(currentUsage) || 0 : undefined,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving stream:', error);
      alert('Failed to save stream. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Stream Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Main Checking Account"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
          autoFocus
        />
      </div>

      {/* Icon Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Icon
        </label>
        <div className="grid grid-cols-4 gap-3">
          {ICONS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setIcon(id);
                if (id === 'card') setIsCreditCard(true);
                else setIsCreditCard(false);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                icon === id
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-400'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Credit Card Specific Fields */}
      {isCreditCard && (
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Credit Limit
            </label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Usage
            </label>
            <input
              type="number"
              value={currentUsage}
              onChange={(e) => setCurrentUsage(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Currency */}
      <CurrencySelector
        value={baseCurrency}
        onChange={setBaseCurrency}
        label="Base Currency"
      />

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ Currency cannot be changed after creation
        </p>
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
          {isSubmitting ? (initial ? 'Saving...' : 'Creating...') : (initial ? 'Save Stream' : 'Create Stream')}
        </button>
      </div>
    </form>
  );
}
