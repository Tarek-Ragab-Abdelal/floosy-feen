'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRepositories } from '@/contexts/RepositoryContext';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

export default function WelcomePage() {
  const router = useRouter();
  const { settingsRepo } = useRepositories();
  const [name, setName] = useState('');
  const [primaryCurrency, setPrimaryCurrency] = useState('EGP');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
      await settingsRepo.create({
        name: name.trim(),
        primaryCurrency,
      });

      router.push('/home');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-900">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center shadow-xl">
            <img src="/logo-no-bg.png" alt="Logo" width={100} height={100}/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to <br/> Floosy-Feen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal finance companion
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          {/* Currency Selector */}
          <CurrencySelector
            value={primaryCurrency}
            onChange={setPrimaryCurrency}
            label="Primary Currency"
          />

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Continue'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          All your data is stored locally on your device
        </p>
      </div>
    </div>
  );
}
