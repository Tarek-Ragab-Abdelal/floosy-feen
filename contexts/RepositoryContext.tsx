'use client';

// Repository Context for dependency injection

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { StreamRepository } from '@/repositories/stream.repository';
import { TransactionRepository } from '@/repositories/transaction.repository';
import { RecurrenceRepository } from '@/repositories/recurrence.repository';
import { TagRepository } from '@/repositories/tag.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { initDB } from '@/lib/db/init';

import { AutomationRepository } from '@/repositories/automation.repository';
import { ExchangeRateRepository } from '@/repositories/exchange-rate.repository';

interface RepositoryContextType {
  streamRepo: StreamRepository;
  transactionRepo: TransactionRepository;
  recurrenceRepo: RecurrenceRepository;
  tagRepo: TagRepository;
  settingsRepo: SettingsRepository;
  automationRepo: AutomationRepository;
  exchangeRateRepo: ExchangeRateRepository;
  isInitialized: boolean;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

import { exchangeRateService } from '@/services/exchange-rate.service';
import { ExchangeRateCache, COMMON_CURRENCIES } from '@/types/domain';
import { runAutomationsForDate } from '@/services/automation.service';

// ... (previous imports)

export function RepositoryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [repositories] = useState({
    streamRepo: new StreamRepository(),
    transactionRepo: new TransactionRepository(),
    recurrenceRepo: new RecurrenceRepository(),
    tagRepo: new TagRepository(),
    settingsRepo: new SettingsRepository(),
    automationRepo: new AutomationRepository(),
    exchangeRateRepo: new ExchangeRateRepository(),
  });

  useEffect(() => {
    initDB()
      .then(async () => {
        setIsInitialized(true);
        console.log('Database initialized successfully');
        
        // Auto-fetch exchange rates for our small set of common currencies if not fetched today
        try {
          const settings = await repositories.settingsRepo.get();
          if (settings) {
            const baseCurrency = settings.primaryCurrency;
            const today = new Date().toISOString().split('T')[0];
            // Check if we already have today's rates for primary currency (as target)
            const allRates = await repositories.exchangeRateRepo.findAll();
            const hasTodayRates = allRates.some(r => r.toCurrency === baseCurrency && r.date?.startsWith(today));

            if (hasTodayRates) {
              console.log('Exchange rates (common currencies) are fresh for primary currency');
            } else {
              const apiKey = process.env.NEXT_PUBLIC_CURRENCYFREAKS_APIKEY;
              if (apiKey) {
                console.log(`Fetching currency rates (USD base) to compute rates for primary ${baseCurrency}...`);
                const data = await exchangeRateService.fetchRates('USD', apiKey);
                // Normalize date to YYYY-MM-DD
                const dateStr = (data.date || new Date()).toString();
                const maybeDate = new Date(dateStr);
                const formattedDate = Number.isNaN(maybeDate.getTime()) ? new Date().toISOString().split('T')[0] : maybeDate.toISOString().split('T')[0];

                const usdRates = Object.entries(data.rates).reduce<Record<string, number>>((acc, [k, v]) => {
                  acc[k] = Number(v);
                  return acc;
                }, {});

                const usdToPrimary = baseCurrency === 'USD' ? 1 : (usdRates[baseCurrency] || null);

                if (baseCurrency !== 'USD' && !usdToPrimary) {
                  console.warn(`Could not find USD->${baseCurrency} rate in fetched data; skipping exchange rate save.`);
                } else {
                  // For our defined COMMON_CURRENCIES, compute FROM -> TO(primary) and save
                  for (const c of COMMON_CURRENCIES) {
                    const from = c.code;
                    if (from === baseCurrency) continue;

                    const usdToFrom = from === 'USD' ? 1 : usdRates[from];
                    if (!usdToFrom) {
                      console.warn(`Missing USD->${from} rate; skipping ${from} -> ${baseCurrency}`);
                      continue;
                    }

                    const rateFromTo = (usdToPrimary === 1 ? 1 : (usdToPrimary ?? 1)) / usdToFrom;

                    const entry: ExchangeRateCache = {
                      id: `${from}_${baseCurrency}_${formattedDate}`,
                      fromCurrency: from,
                      toCurrency: baseCurrency,
                      rate: Number(rateFromTo),
                      date: formattedDate,
                      fetchedAt: new Date(),
                    };

                    await repositories.exchangeRateRepo.saveRate(entry);
                  }
                  console.log('Computed and saved exchange rates for common currencies');
                }
              } else {
                console.warn('CurrencyFreaks API key missing (NEXT_PUBLIC_CURRENCYFREAKS_APIKEY). Skipping fetch.');
              }
            }
          }
        } catch (err) {
          console.error('Error auto-fetching rates:', err);
        }
        // Run automations for today (creates transactions if scheduled)
        try {
          await runAutomationsForDate(repositories, new Date());
        } catch (err) {
          console.error('Error running automations on init:', err);
        }
      })
      .catch(error => {
        console.error('Failed to initialize database:', error);
      });
  }, []);

  const contextValue = React.useMemo(
    () => ({ ...repositories, isInitialized }),
    [repositories, isInitialized]
  );

  return (
    <RepositoryContext.Provider value={contextValue}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoryProvider');
  }
  return context;
}
