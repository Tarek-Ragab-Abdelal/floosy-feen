// Balance Calculation Utilities

import { Transaction } from '@/types/domain';

export interface BalanceResult {
  total: number;
  currency: string;
}

export interface StreamBalance {
  streamId: string;
  balance: number;
  currency: string;
}

/**
 * Calculate money in hand (transactions with applicability date <= asOfDate)
 */
/**
 * Calculate money in hand (transactions with applicability date <= asOfDate)
 * Converts all amounts to target currency if rates provided.
 */
export function calculateMoneyInHand(
  transactions: Transaction[],
  asOfDate: Date,
  targetCurrency?: string,
  rates?: Map<string, number> // Map<"FROM_TO", rate>
): number {
  return transactions
    .filter(tx => tx.applicabilityDate <= asOfDate)
    .reduce((sum, tx) => {
      let amount = tx.amount;
      
      // Convert if needed
      if (targetCurrency && tx.currency !== targetCurrency && rates) {
        // Direct rate
        const directKey = `${tx.currency}_${targetCurrency}`;
        const inverseKey = `${targetCurrency}_${tx.currency}`;
        
        if (rates.has(directKey)) {
          amount *= rates.get(directKey)!;
        } else if (rates.has(inverseKey)) {
          amount /= rates.get(inverseKey)!;
        } else {
          // If no rate found, we might want to log or ignore. For now, we assume 1:1 fallback or user beware.
          // In a real app we'd flag this.
          // console.warn(`No rate found for ${tx.currency} -> ${targetCurrency}`);
        }
      }

      return tx.type === 'income' ? sum + amount : sum - amount;
    }, 0);
}

/**
 * Calculate projected money (transactions with applicability date > asOfDate)
 */
export function calculateProjectedMoney(
  transactions: Transaction[],
  asOfDate: Date,
  targetCurrency?: string,
  rates?: Map<string, number>
): number {
  return transactions
    .filter(tx => tx.applicabilityDate > asOfDate)
    .reduce((sum, tx) => {
      let amount = tx.amount;
      
      if (targetCurrency && tx.currency !== targetCurrency && rates) {
        const directKey = `${tx.currency}_${targetCurrency}`;
        const inverseKey = `${targetCurrency}_${tx.currency}`;
        
        if (rates.has(directKey)) {
          amount *= rates.get(directKey)!;
        } else if (rates.has(inverseKey)) {
          amount /= rates.get(inverseKey)!;
        }
      }

      return tx.type === 'income' ? sum + amount : sum - amount;
    }, 0);
}

/**
 * Calculate total balance (all transactions regardless of date)
 */
export function calculateTotalBalance(
  transactions: Transaction[],
  targetCurrency?: string,
  rates?: Map<string, number>
): number {
  return transactions.reduce((sum, tx) => {
    let amount = tx.amount;
      
    if (targetCurrency && tx.currency !== targetCurrency && rates) {
      const directKey = `${tx.currency}_${targetCurrency}`;
      const inverseKey = `${targetCurrency}_${tx.currency}`;
      
      if (rates.has(directKey)) {
        amount *= rates.get(directKey)!;
      } else if (rates.has(inverseKey)) {
        amount /= rates.get(inverseKey)!;
      }
    }

    return tx.type === 'income' ? sum + amount : sum - amount;
  }, 0);
}

/**
 * Calculate balance for a specific stream (No conversion usually needed as stream is single currency, but mostly strictly sums transactions)
 */
export function calculateStreamBalance(
  transactions: Transaction[],
  streamId: string,
  asOfDate: Date
): number {
  const streamTransactions = transactions.filter(
    tx => tx.streamId === streamId && tx.applicabilityDate <= asOfDate
  );
  
  return calculateMoneyInHand(streamTransactions, asOfDate); // No conversion needed usually for stream specific
}

/**
 * Calculate balances grouped by stream
 */
export function calculateStreamBalances(
  transactions: Transaction[],
  asOfDate: Date
): Map<string, number> {
  const balances = new Map<string, number>();

  transactions
    .filter(tx => tx.applicabilityDate <= asOfDate)
    .forEach(tx => {
      const current = balances.get(tx.streamId) || 0;
      const newBalance = tx.type === 'income' ? current + tx.amount : current - tx.amount;
      balances.set(tx.streamId, newBalance);
    });

  return balances;
}

/**
 * Calculate balance over time for charting
 */
export function calculateBalanceOverTime(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  intervalDays: number = 1,
  targetCurrency?: string,
  rates?: Map<string, number>
): Array<{ date: Date; balance: number }> {
  const result: Array<{ date: Date; balance: number }> = [];
  const sortedTx = [...transactions].sort(
    (a, b) => a.applicabilityDate.getTime() - b.applicabilityDate.getTime()
  );

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const balance = calculateMoneyInHand(sortedTx, currentDate, targetCurrency, rates);
    result.push({ date: new Date(currentDate), balance });
    
    currentDate.setDate(currentDate.getDate() + intervalDays);
  }

  return result;
}

/**
 * Calculate income vs expense totals for a date range
 */
export function calculateIncomeVsExpense(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  targetCurrency?: string,
  rates?: Map<string, number>
): { income: number; expense: number } {
  const filtered = transactions.filter(
    tx => tx.applicabilityDate >= startDate && tx.applicabilityDate <= endDate
  );

  const calculateSum = (txs: Transaction[]) => txs.reduce((sum, tx) => {
    let amount = tx.amount;
    if (targetCurrency && tx.currency !== targetCurrency && rates) {
       const directKey = `${tx.currency}_${targetCurrency}`;
       const inverseKey = `${targetCurrency}_${tx.currency}`;
       if (rates.has(directKey)) amount *= rates.get(directKey)!;
       else if (rates.has(inverseKey)) amount /= rates.get(inverseKey)!;
    }
    return sum + amount;
  }, 0);

  const income = calculateSum(filtered.filter(tx => tx.type === 'income'));
  const expense = calculateSum(filtered.filter(tx => tx.type === 'expense'));

  return { income, expense };
}
