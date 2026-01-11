import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CurrencyBannerProps {
  currenciesInUse: string[];
}

export function CurrencyBanner({ currenciesInUse }: Readonly<CurrencyBannerProps>) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Multi-Currency Account
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You have {currenciesInUse.length} currencies in use: {currenciesInUse.join(', ')}.
          </p>
        </div>
      </div>
    </div>
  );
}
