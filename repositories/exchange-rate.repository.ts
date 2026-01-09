import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { ExchangeRateCache } from '@/types/domain';

export class ExchangeRateRepository {
  async getRate(from: string, to: string, date: string): Promise<ExchangeRateCache | null> {
    const db = await getDB();
    const id = `${from}_${to}_${date}`;
    return (await db.get(STORES.EXCHANGE_RATES, id)) || null;
  }

  async saveRate(rate: ExchangeRateCache): Promise<void> {
    const db = await getDB();
    await db.put(STORES.EXCHANGE_RATES, rate);
  }

  async getLatestRate(from: string, to: string): Promise<ExchangeRateCache | null> {
    const db = await getDB();
    const index = db.transaction(STORES.EXCHANGE_RATES).store.index('by-currencies');
    const logs = await index.getAll([from, to]);
    
    if (logs.length === 0) return null;
    
    // Sort by date descending and pick first
    logs.sort((a, b) => b.date.localeCompare(a.date));
    return logs[0];
  }

  async findAll(): Promise<ExchangeRateCache[]> {
    const db = await getDB();
    return db.getAll(STORES.EXCHANGE_RATES);
  }
}

export const exchangeRateRepo = new ExchangeRateRepository();
