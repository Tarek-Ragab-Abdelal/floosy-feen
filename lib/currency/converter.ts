// Currency Conversion Utilities

import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { ExchangeRateCache } from '@/types/domain';
import { format } from 'date-fns';

const PRIMARY_API = 'https://api.exchangerate-api.com/v4/latest/';
const FALLBACK_API = 'https://api.frankfurter.app/latest';
const CACHE_DURATION_HOURS = 24;

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
}

/**
 * Fetch exchange rate from API with fallback
 */
export async function fetchExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // Check cache first
  const cached = await getCachedRate(fromCurrency, toCurrency);
  if (cached) {
    return cached.rate;
  }

  // Try primary API
  try {
    const rate = await fetchFromPrimaryAPI(fromCurrency, toCurrency);
    await cacheRate(fromCurrency, toCurrency, rate);
    return rate;
  } catch (error) {
    console.warn('Primary API failed, trying fallback:', error);
    
    // Try fallback API
    try {
      const rate = await fetchFromFallbackAPI(fromCurrency, toCurrency);
      await cacheRate(fromCurrency, toCurrency, rate);
      return rate;
    } catch (fallbackError) {
      console.error('Both APIs failed:', fallbackError);
      throw new Error('Unable to fetch exchange rate. Please check your internet connection.');
    }
  }
}

/**
 * Fetch from exchangerate-api.com (primary)
 */
async function fetchFromPrimaryAPI(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const response = await fetch(`${PRIMARY_API}${fromCurrency}`);
  
  if (!response.ok) {
    throw new Error(`Primary API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.rates?.[toCurrency]) {
    throw new Error(`Currency ${toCurrency} not found in response`);
  }

  return data.rates[toCurrency];
}

/**
 * Fetch from frankfurter.app (fallback)
 */
async function fetchFromFallbackAPI(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const response = await fetch(`${FALLBACK_API}?from=${fromCurrency}&to=${toCurrency}`);
  
  if (!response.ok) {
    throw new Error(`Fallback API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.rates?.[toCurrency]) {
    throw new Error(`Currency ${toCurrency} not found in fallback response`);
  }

  return data.rates[toCurrency];
}

/**
 * Convert amount from one currency to another
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  // Same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return {
      originalAmount: amount,
      convertedAmount: amount,
      fromCurrency,
      toCurrency,
      rate: 1,
      date: format(new Date(), 'yyyy-MM-dd'),
    };
  }

  const rate = await fetchExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = amount * rate;

  return {
    originalAmount: amount,
    convertedAmount,
    fromCurrency,
    toCurrency,
    rate,
    date: format(new Date(), 'yyyy-MM-dd'),
  };
}

/**
 * Get cached exchange rate if available and not expired
 */
async function getCachedRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRateCache | null> {
  try {
    const db = await getDB();
    const today = format(new Date(), 'yyyy-MM-dd');
    const cacheId = `${fromCurrency}_${toCurrency}_${today}`;
    
    const cached = await db.get(STORES.EXCHANGE_RATES, cacheId);
    
    if (!cached) return null;

    // Check if cache is still valid (within 24 hours)
    const fetchedAt = new Date(cached.fetchedAt);
    const now = new Date();
    const hoursSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceFetch > CACHE_DURATION_HOURS) {
      // Cache expired, delete it
      await db.delete(STORES.EXCHANGE_RATES, cacheId);
      return null;
    }

    return {
      ...cached,
      fetchedAt: new Date(cached.fetchedAt),
    };
  } catch (error) {
    console.error('Error getting cached rate:', error);
    return null;
  }
}

/**
 * Cache exchange rate
 */
async function cacheRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number
): Promise<void> {
  try {
    const db = await getDB();
    const today = format(new Date(), 'yyyy-MM-dd');
    const cacheId = `${fromCurrency}_${toCurrency}_${today}`;

    const cacheData = {
      id: cacheId,
      fromCurrency,
      toCurrency,
      rate,
      date: today,
      fetchedAt: new Date().toISOString(),
    };

    await db.put(STORES.EXCHANGE_RATES, cacheData);
  } catch (error) {
    console.error('Error caching rate:', error);
    // Don't throw, caching failure shouldn't break the conversion
  }
}

/**
 * Clear old cached rates (cleanup utility)
 */
export async function clearOldCachedRates(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORES.EXCHANGE_RATES, 'readwrite');
    const store = tx.objectStore(STORES.EXCHANGE_RATES);
    const allRates = await store.getAll();

    const now = new Date();
    const deletePromises = [];

    for (const rate of allRates) {
      const fetchedAt = new Date(rate.fetchedAt);
      const hoursSinceFetch = (now.getTime() - fetchedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceFetch > CACHE_DURATION_HOURS) {
        deletePromises.push(store.delete(rate.id));
      }
    }

    await Promise.all(deletePromises);
    await tx.done;
  } catch (error) {
    console.error('Error clearing old cached rates:', error);
  }
}

/**
 * Fetch and cache exchange rates for all needed currency pairs
 * @param baseCurrency The primary/target currency to convert to
 * @param currencies List of all currencies that need conversion rates
 */
export async function fetchAndCacheRatesForCurrencies(
  baseCurrency: string,
  currencies: string[]
): Promise<Map<string, number>> {
  const rateMap = new Map<string, number>();
  
  // Get unique currencies that need conversion (excluding base currency)
  const uniqueCurrencies = Array.from(new Set(currencies.filter(c => c !== baseCurrency)));
  
  // Fetch rates for each currency pair
  for (const currency of uniqueCurrencies) {
    try {
      // Check if we already have a cached rate
      const cached = await getCachedRate(currency, baseCurrency);
      if (cached) {
        rateMap.set(`${currency}_${baseCurrency}`, cached.rate);
        continue;
      }
      
      // Fetch new rate
      const rate = await fetchExchangeRate(currency, baseCurrency);
      rateMap.set(`${currency}_${baseCurrency}`, rate);
      
      // Rate is already cached by fetchExchangeRate
    } catch (error) {
      console.error(`Failed to fetch rate for ${currency} -> ${baseCurrency}:`, error);
      // Continue with other rates even if one fails
    }
  }
  
  return rateMap;
}
