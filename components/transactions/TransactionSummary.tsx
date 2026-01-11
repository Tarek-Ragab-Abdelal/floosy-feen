import React from 'react';

interface TransactionSummaryProps {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  currency?: string;
}

export function TransactionSummary({ totalTransactions, totalIncome, totalExpense, currency }: Readonly<TransactionSummaryProps>) {
  const netBalance = totalIncome - totalExpense;
  const isPositive = netBalance >= 0;
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">Showing Results</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalTransactions} <span className="text-sm font-normal text-slate-500">transactions</span>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-lg ${
          isPositive 
            ? 'bg-emerald-500 dark:bg-emerald-600' 
            : 'bg-orange-500 dark:bg-orange-600'
        }`}>
          <div className="text-[10px] text-white/80 mb-0.5">Net Balance</div>
          <div className="text-lg font-bold text-white">
            {isPositive ? '+' : ''}{currency} {netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
