'use client';

import React, { useState } from 'react';
import { Stream } from '@/types/domain';
import { useRepositories } from '@/contexts/RepositoryContext';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { BaseStepperForm } from './BaseStepperForm';
import { Building2, Banknote, CreditCard, Wallet } from 'lucide-react';

const ICONS = [
  { id: 'bank', icon: Building2, label: 'Bank' },
  { id: 'cash', icon: Banknote, label: 'Cash' },
  { id: 'card', icon: CreditCard, label: 'Card' },
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
];

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name & icon' },
  { id: 2, title: 'Currency', description: 'Select currency' },
  { id: 3, title: 'Details', description: 'Additional settings' },
];

interface StreamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initial?: Stream | null;
}

export function StreamForm({ onSuccess, onCancel, initial = null }: Readonly<StreamFormProps>) {
  const { streamRepo, transactionRepo } = useRepositories();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || 'bank');
  const [baseCurrency, setBaseCurrency] = useState(initial?.baseCurrency || 'USD');
  
  const [isCreditCard, setIsCreditCard] = useState(initial?.isCreditCard || false);
  const [creditLimit, setCreditLimit] = useState(initial?.creditLimit == null ? '' : String(initial.creditLimit));
  const [currentUsage, setCurrentUsage] = useState(initial?.currentUsage == null ? '' : String(initial.currentUsage));
  
  const [initialBalance, setInitialBalance] = useState('');
  const [includeInitialBalance, setIncludeInitialBalance] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = baseCurrency.length > 0;
  const canProceedStep3 = !isCreditCard || (!!creditLimit && !!currentUsage);

  let canProceed;
  if (currentStep === 1) {
    canProceed = canProceedStep1;
  } else if (currentStep === 2) {
    canProceed = canProceedStep2;
  } else {
    canProceed = canProceedStep3;
  }

  const handleSubmit = async () => {
    console.log('StreamForm submitted', { name, icon, baseCurrency, isCreditCard, creditLimit, currentUsage });

    setIsSubmitting(true);

    try {
      if (initial?.id) {
        const updates: Partial<Stream> = {
          name: name.trim(),
          icon,
          baseCurrency: initial.baseCurrency, // baseCurrency cannot change
          isCreditCard,
        };

        if (isCreditCard) {
          updates.creditLimit = Number.parseFloat(creditLimit) || 0;
          updates.currentUsage = Number.parseFloat(currentUsage) || 0;
        } else {
          updates.creditLimit = undefined;
          updates.currentUsage = undefined;
        }

        await streamRepo.update(initial.id, updates);
      } else {
        // Create new stream
        const newStream = await streamRepo.create({
          name: name.trim(),
          icon,
          baseCurrency,
          isCreditCard,
          creditLimit: isCreditCard ? Number.parseFloat(creditLimit) || 0 : undefined,
          currentUsage: isCreditCard ? Number.parseFloat(currentUsage) || 0 : undefined,
        });
        
        // Create initial balance transaction if requested
        if (includeInitialBalance && initialBalance && Number.parseFloat(initialBalance) !== 0) {
          const amount = Math.abs(Number.parseFloat(initialBalance));
          const type: 'income' | 'expense' = Number.parseFloat(initialBalance) >= 0 ? 'income' : 'expense';
          
          await transactionRepo.create({
            streamId: newStream.id,
            amount,
            currency: baseCurrency,
            applicabilityDate: new Date(),
            type,
            tags: [],
            description: 'Initial balance',
            recurrenceId: null,
          });
          
          console.log('Initial balance transaction created');
        }
      }
      
      // Small delay to ensure all IndexedDB operations are persisted
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Call onSuccess after all operations complete
      onSuccess();
    } catch (error) {
      console.error('Error saving stream:', error);
      alert('Failed to save stream. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Extract button label to avoid nested ternary
  return (
    <BaseStepperForm
      steps={STEPS}
      currentStep={currentStep}
      onCancel={onCancel}
      onNext={() => setCurrentStep(prev => prev + 1)}
      onPrevious={() => setCurrentStep(prev => prev - 1)}
      onSubmit={handleSubmit}
      canProceed={canProceed}
      isSubmitting={isSubmitting}
      submitLabel={initial ? 'Save Stream' : 'Create Stream'}
    >
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Stream Name
            </span>
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

          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icon
            </span>
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
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <CurrencySelector
            value={baseCurrency}
            onChange={setBaseCurrency}
            label="Base Currency"
            disabled={!!initial}
          />

          {initial && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Currency cannot be changed after creation
              </p>
            </div>
          )}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          {isCreditCard && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Credit Limit
                </label>
                <input
                  id="creditLimit"
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Usage
                </span>
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

          {!initial && !isCreditCard && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeInitialBalance"
                  checked={includeInitialBalance}
                  onChange={(e) => setIncludeInitialBalance(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="includeInitialBalance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Set initial balance
                </label>
              </div>
              
              {includeInitialBalance && (
                <div className="space-y-2 animate-slide-up">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Initial Balance
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter positive for income, negative for expense
                  </p>
                </div>
              )}
            </div>
          )}

          {!isCreditCard && !initial && !includeInitialBalance && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No additional settings required.</p>
              <p className="text-sm mt-2">Click "Create Stream" to finish.</p>
            </div>
          )}
        </div>
      )}
    </BaseStepperForm>
  );
}
