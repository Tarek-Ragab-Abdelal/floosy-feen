import React from 'react';
import { CreditCard } from 'lucide-react';
import { Stream, Transaction } from '@/types/domain';
import { format } from 'date-fns';

interface CreditSummaryCardProps {
  streams: Stream[];
  transactions: Transaction[];
  selectedDate: Date;
  currency: string;
}

export function CreditSummaryCard({ streams, transactions, selectedDate, currency }: Readonly<CreditSummaryCardProps>) {
  // Filter only credit card streams
  const creditCards = streams.filter(s => s.isCreditCard && s.creditLimit);
  
  if (creditCards.length === 0) {
    return null;
  }

  // Calculate total credit limit and available credit
  let totalCreditLimit = 0;
  let totalUsedCredit = 0;

  creditCards.forEach(card => {
    const creditLimit = card.creditLimit || 0;
    totalCreditLimit += creditLimit;

    // Calculate current usage from transactions up to selected date
    const cardTransactions = transactions.filter(
      tx => tx.streamId === card.id && tx.applicabilityDate <= selectedDate
    );

    // Calculate transaction-based usage change (expenses increase, income decreases)
    const transactionUsage = cardTransactions.reduce((sum, tx) => {
      return tx.type === 'expense' ? sum + tx.amount : sum - tx.amount;
    }, 0);
    
    // Total usage = initial usage + transaction changes
    const usage = (card.currentUsage || 0) + transactionUsage;

    totalUsedCredit += usage;
  });

  const availableCredit = totalCreditLimit - totalUsedCredit;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 opacity-90" />
          <span className="text-sm font-medium opacity-90">Available Credit</span>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 break-words">
          {currency} {availableCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="opacity-90">As of {format(selectedDate, 'MMM dd, yyyy')}</span>
            <span className="opacity-75 text-xs">
              Total credit line: {currency} {totalCreditLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
    </div>
  );
}
