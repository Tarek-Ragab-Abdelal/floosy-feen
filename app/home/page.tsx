'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { useDate } from '@/contexts/DateContext';
import { DateSelector } from '@/components/ui/DateSelector';
import { Modal } from '@/components/ui/Modal';
import { calculateMoneyInHand } from '@/lib/calculations/balance';
import { generateAllProjectionsWithAutomations, combineRealAndProjected } from '@/lib/calculations/projections';
import { fetchAndCacheRatesForCurrencies } from '@/lib/currency/converter';
import { Transaction, Stream, UserSettings, Automation, Recurrence } from '@/types/domain';
import { format, isSameDay } from 'date-fns';
import { StreamForm } from '@/components/forms/StreamForm';
import { DateBanner } from '@/components/home/DateBanner';
import { CurrencyBanner } from '@/components/home/CurrencyBanner';
import { BalanceCard } from '@/components/home/BalanceCard';
import { CreditSummaryCard } from '@/components/home/CreditSummaryCard';
import { StreamsSection } from '@/components/home/StreamsSection';

export default function HomePage() {
  const { transactionRepo, streamRepo, settingsRepo, automationRepo, recurrenceRepo, isInitialized } = useRepositories();
  const { selectedDate } = useDate();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    loadData();
  }, [isInitialized, selectedDate]);

  const [exchangeRates, setExchangeRates] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!isInitialized) return;

    loadData();
  }, [isInitialized, selectedDate]);

  const loadData = async () => {
    try {
      const [txs, strms, stgs, autos, recs] = await Promise.all([
        transactionRepo.findAll(),
        streamRepo.findActive(),
        settingsRepo.get(),
        automationRepo.findAll(),
        recurrenceRepo.findAll(),
      ]);

      console.log('Loaded transactions:', txs.length, txs);
      console.log('Loaded streams:', strms.length, strms);

      setTransactions(txs);
      setStreams(strms);
      setSettings(stgs);
      setAutomations(autos);
      setRecurrences(recs);

      // Fetch exchange rates for all currencies in use
      if (stgs?.primaryCurrency) {
        // Get all unique currencies from streams and transactions
        const streamCurrencies = strms.map(s => s.baseCurrency);
        const txCurrencies = txs.map(t => t.currency);
        const allCurrencies = Array.from(new Set([...streamCurrencies, ...txCurrencies]));
        
        // Fetch and cache rates for all currency pairs
        try {
          const rates = await fetchAndCacheRatesForCurrencies(stgs.primaryCurrency, allCurrencies);
          setExchangeRates(rates);
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
          // Continue without rates - will show warning or use 1:1
          setExchangeRates(new Map());
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStream = async (streamId: string, transferToStreamId?: string) => {
    try {
      const streamTransactions = transactions.filter(tx => tx.streamId === streamId);
      
      if (transferToStreamId) {
        const targetStream = streams.find(s => s.id === transferToStreamId);
        const sourceStream = streams.find(s => s.id === streamId);
        
        // Transfer transactions to another stream with currency conversion if needed
        for (const tx of streamTransactions) {
          const updates: Partial<Transaction> = { streamId: transferToStreamId };
          
          // Convert currency if target stream has different currency
          if (targetStream && sourceStream && tx.currency !== targetStream.baseCurrency) {
            updates.currency = targetStream.baseCurrency;
            
            // Convert amount if exchange rates are available
            if (exchangeRates.size > 0) {
              const directKey = `${tx.currency}_${targetStream.baseCurrency}`;
              const inverseKey = `${targetStream.baseCurrency}_${tx.currency}`;
              
              if (exchangeRates.has(directKey)) {
                updates.amount = tx.amount * exchangeRates.get(directKey)!;
              } else if (exchangeRates.has(inverseKey)) {
                updates.amount = tx.amount / exchangeRates.get(inverseKey)!;
              }
            }
          }
          
          await transactionRepo.update(tx.id, updates);
        }
      } else {
        // Delete all transactions
        for (const tx of streamTransactions) {
          await transactionRepo.delete(tx.id);
        }
      }
      
      // Delete the stream
      await streamRepo.delete(streamId);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error deleting stream:', error);
      alert('Failed to delete stream. Please try again.');
    }
  };

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream);
    setShowStreamModal(true);
  };

  const handleStreamModalClose = () => {
    setShowStreamModal(false);
    setEditingStream(null);
  };

  const handleStreamSuccess = async () => {
    setShowStreamModal(false);
    setEditingStream(null);
    await loadData();
  };

  // Generate projected transactions from automations and recurrences up to selected date
  const today = new Date();
  const futureDate = new Date(selectedDate);
  futureDate.setFullYear(futureDate.getFullYear() + 2); // Project 2 years into future for range
  
  const projectedTransactions = generateAllProjectionsWithAutomations(
    recurrences,
    automations,
    streams,
    today,
    futureDate
  );
  
  // Combine actual and projected transactions
  const allTransactions = combineRealAndProjected(transactions, projectedTransactions);
  
  // Get credit card stream IDs for filtering
  const creditCardStreams = streams.filter(s => s.isCreditCard);
  const creditCardStreamIds = new Set(creditCardStreams.map(s => s.id));
  
  // Calculate balance excluding credit card transactions (credit cards are liabilities, tracked separately)
  const nonCreditCardTransactions = allTransactions.filter(tx => !creditCardStreamIds.has(tx.streamId));
  let balance = calculateMoneyInHand(
    nonCreditCardTransactions as Transaction[],
    selectedDate,
    settings?.primaryCurrency,
    exchangeRates
  );
  
  // Subtract credit card usage (liability) from balance
  creditCardStreams.forEach(card => {
    const cardTransactions = transactions.filter(
      tx => tx.streamId === card.id && tx.applicabilityDate <= selectedDate
    );
    
    // Calculate transaction-based usage change (expenses increase usage, payments decrease it)
    const transactionUsage = cardTransactions.reduce((sum, tx) => {
      let amount = tx.amount;
      
      // Convert to primary currency if needed
      if (settings?.primaryCurrency && tx.currency !== settings.primaryCurrency && exchangeRates.size > 0) {
        const directKey = `${tx.currency}_${settings.primaryCurrency}`;
        const inverseKey = `${settings.primaryCurrency}_${tx.currency}`;
        
        if (exchangeRates.has(directKey)) {
          amount *= exchangeRates.get(directKey)!;
        } else if (exchangeRates.has(inverseKey)) {
          amount /= exchangeRates.get(inverseKey)!;
        }
      }
      
      return tx.type === 'expense' ? sum + amount : sum - amount;
    }, 0);
    
    // Total usage = initial usage + transaction changes
    const totalUsage = (card.currentUsage || 0) + transactionUsage;
    
    // Subtract total usage from overall balance (credit card debt is a liability)
    balance -= totalUsage;
  });
  
  // Check if multiple currencies are in use
  const currenciesInUse = Array.from(new Set([
    ...streams.map(s => s.baseCurrency),
    ...transactions.map(t => t.currency)
  ]));
  const hasMultipleCurrencies = currenciesInUse.length > 1;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="lg:pt-20 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {settings?.name || 'User'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>

          <DateSelector/>
        </div>
        
        {/* Date Preview Banner - Show when not viewing today */}
        {!isSameDay(selectedDate, new Date()) && (
          <DateBanner selectedDate={selectedDate} />
        )}
        
        {/* Currency Conversion Info Banner */}
        {hasMultipleCurrencies && (
          <CurrencyBanner currenciesInUse={currenciesInUse} />
        )}

        {/* Hero Card - Balance */}
        <BalanceCard 
          balance={balance}
          currency={settings?.primaryCurrency || 'USD'}
          selectedDate={selectedDate}
        />

        {/* Credit Summary Card */}
        <CreditSummaryCard
          streams={streams}
          transactions={transactions}
          selectedDate={selectedDate}
          currency={settings?.primaryCurrency || 'USD'}
        />

        {/* Streams Section */}
        <StreamsSection
          streams={streams}
          transactions={transactions}
          selectedDate={selectedDate}
          onCreateStream={() => setShowStreamModal(true)}
          onDeleteStream={handleDeleteStream}
          onEditStream={handleEditStream}
        />
      </div>

      {/* Stream Form Modal */}
      <Modal
        isOpen={showStreamModal}
        onClose={handleStreamModalClose}
        title={editingStream ? 'Edit Stream' : 'Create Stream'}
      >
        <StreamForm
          initial={editingStream}
          onSuccess={handleStreamSuccess}
          onCancel={handleStreamModalClose}
        />
      </Modal>
    </AppLayout>
  );
}
