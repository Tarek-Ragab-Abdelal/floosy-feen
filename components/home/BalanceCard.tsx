import React from 'react';
import { Wallet } from 'lucide-react';
import { format } from 'date-fns';

interface BalanceCardProps {
  balance: number;
  currency: string;
  selectedDate: Date;
}

export function BalanceCard({ balance, currency, selectedDate }: Readonly<BalanceCardProps>) {
  return (
    <div className="relative overflow-hidden bg-emerald-600 rounded-3xl shadow-xl p-8 text-white">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 opacity-90" />
          <span className="text-sm font-medium opacity-90">Balance</span>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 break-words">
          {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="opacity-90">As of {format(selectedDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
    </div>
  );
}
