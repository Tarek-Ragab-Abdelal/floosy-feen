import axios from 'axios';

const API_BASE = 'https://api.currencyfreaks.com/v2.0/rates/latest';

export interface ExchangeRateResponse {
  base: string;
  date: string; // may include time
  rates: Record<string, string | number>;
}

export class ExchangeRateService {
  async fetchRates(baseCurrency: string, apiKey?: string): Promise<ExchangeRateResponse> {
    const key = apiKey || process.env.NEXT_PUBLIC_CURRENCYFREAKS_APIKEY;
    if (!key) {
      throw new Error('CurrencyFreaks API key missing. Set NEXT_PUBLIC_CURRENCYFREAKS_APIKEY in env.');
    }

    try {
      // CurrencyFreaks endpoint is fixed to USD for our usage — do not send a base param.
      const url = `${API_BASE}?apikey=${encodeURIComponent(key)}`;
      const resp = await axios.get<ExchangeRateResponse>(url);
      const data = resp.data;
      // Ensure base is set to USD (the service returns USD as base for this endpoint).
      if (!data.base) data.base = 'USD';
      // Some rates may come as strings; callers should handle conversion as needed.
      return data;
    } catch (err) {
      console.error('Failed to fetch rates from CurrencyFreaks', err);
      throw err;
    }
  }
}

export const exchangeRateService = new ExchangeRateService();
