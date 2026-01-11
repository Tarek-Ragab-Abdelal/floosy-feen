'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { downloadCSV, downloadJSON } from '@/lib/export/exporter';
import { resetDB } from '@/lib/db/init';
import { UserSettings } from '@/types/domain';
// Imports updated
import { exchangeRateRepo } from '@/repositories/exchange-rate.repository';
import { ExchangeRateCache, COMMON_CURRENCIES } from '@/types/domain';
import { Settings as SettingsIcon, Download, Trash2, Save, RefreshCw } from 'lucide-react';
import { format, subMonths } from 'date-fns';

export default function SettingsPage() {
  const { settingsRepo, streamRepo, transactionRepo, recurrenceRepo, tagRepo, isInitialized } = useRepositories();
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [name, setName] = useState('');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [exportFromDate, setExportFromDate] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
  const [exportToDate, setExportToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Exchange Rates State (read-only)
  const [rates, setRates] = useState<ExchangeRateCache[]>([]);
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    loadSettings();
  }, [isInitialized]);

  const loadSettings = async () => {
    try {
      const stgs = await settingsRepo.get();
      if (stgs) {
        setSettings(stgs);
        setName(stgs.name);
        setPrimaryCurrency(stgs.primaryCurrency);
        
        // Load rates
        // We want rates where 'to' is primary currency, basically Foreign -> Primary
        const allRates = await exchangeRateRepo.findAll();
        // Filter for display? Or show all? Show all for now but sorted.
        setRates(allRates.sort((a,b) => b.date.localeCompare(a.date)));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async () => {
    if (!exchangeRate || parseFloat(exchangeRate) <= 0) {
      alert('Please enter a valid rate');
      return;
    }
    if (targetCurrency === primaryCurrency) {
      alert('Target currency cannot be same as primary');
      return;
    }

    try {
      // Save Foreign -> Primary
      // e.g. 1 USD = 50 EGP (if Primary is EGP)
      // from: USD, to: EGP, rate: 50
      
      const newRate: ExchangeRateCache = {
        id: `${targetCurrency}_${primaryCurrency}_${format(new Date(), 'yyyy-MM-dd')}`,
        fromCurrency: targetCurrency,
        toCurrency: primaryCurrency,
        rate: parseFloat(exchangeRate),
        date: format(new Date(), 'yyyy-MM-dd'),
        fetchedAt: new Date(),
      };
      
      await exchangeRateRepo.saveRate(newRate);
      
      // Also save inverse? Usually good practice but balance calc handles inverse if missing.
      // Let's just save one way for now.
      
      alert('Rate saved');
      setExchangeRate('');
      loadSettings();
    } catch (error) {
      console.error('Error saving rate:', error);
      alert('Failed to save rate');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSaving(true);

    try {
      await settingsRepo.update({
        name: name.trim(),
        primaryCurrency,
      });

      alert('Settings saved successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const [transactions, streams] = await Promise.all([
        transactionRepo.findByDateRange(new Date(exportFromDate), new Date(exportToDate)),
        streamRepo.findAll(),
      ]);

      downloadCSV(transactions, streams, {
        from: new Date(exportFromDate),
        to: new Date(exportToDate),
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportJSON = async () => {
    try {
      const [streams, transactions, recurrences, tags, settings] = await Promise.all([
        streamRepo.findAll(),
        transactionRepo.findByDateRange(new Date(exportFromDate), new Date(exportToDate)),
        recurrenceRepo.findAll(),
        tagRepo.findAll(),
        settingsRepo.get(),
      ]);

      downloadJSON({
        exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        dateRange: {
          from: exportFromDate,
          to: exportToDate,
        },
        settings,
        streams,
        transactions,
        recurrences,
        tags,
      });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Failed to export JSON. Please try again.');
    }
  };

  const handleResetData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all data? This action cannot be undone!'
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This will delete ALL your data including streams, transactions, and settings. Are you absolutely sure?'
    );

    if (!doubleConfirmed) return;

    try {
      await resetDB();
      window.location.href = '/';
    } catch (error) {
      console.error('Error resetting database:', error);
      alert('Failed to reset data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <SettingsIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your preferences and data
          </p>
        </div>

        {/* User Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Preferences
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <CurrencySelector
              value={primaryCurrency}
              onChange={setPrimaryCurrency}
              label="Primary Currency"
            />

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Exchange Rates
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Set rates to convert foreign currencies to your primary currency ({primaryCurrency})
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Rates are automatically fetched and stored for common currencies: {COMMON_CURRENCIES.map(c => c.code).join(', ')}. Manual entry is disabled.</p>
            </div>

            {/* Rates List */}
            <div className="space-y-2">
               <h3 className="text-sm font-medium text-gray-900 dark:text-white">Recent Rates</h3>
               {rates.length === 0 ? (
                 <p className="text-sm text-gray-500 italic">No rates available yet.</p>
               ) : (
                 <div className="grid gap-2">
                   {rates
                     .filter(r => r.toCurrency === primaryCurrency)
                     .sort((a,b) => b.date.localeCompare(a.date))
                     .slice(0, 10)
                     .map(rate => (
                       <div key={rate.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                         <span className="font-medium text-gray-900 dark:text-white truncate">
                           1 {rate.fromCurrency} = {Number(rate.rate).toFixed(6)} {rate.toCurrency}
                         </span>
                         <span className="text-xs text-gray-500">
                           {rate.date}
                         </span>
                       </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Data
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  From Date
                </label>
                <input
                  type="date"
                  value={exportFromDate}
                  onChange={(e) => setExportFromDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  To Date
                </label>
                <input
                  type="date"
                  value={exportToDate}
                  onChange={(e) => setExportToDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export JSON
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              CSV exports transactions for the selected date range. JSON exports include all data for backup/migration.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800 space-y-4">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
            Danger Zone
          </h2>

          <p className="text-sm text-red-800 dark:text-red-300">
            Resetting your data will permanently delete all streams, transactions, recurrences, tags, and settings. This action cannot be undone.
          </p>

          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Reset All Data
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
