import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DateBannerProps {
  selectedDate: Date;
}

export function DateBanner({ selectedDate }: Readonly<DateBannerProps>) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
            Projected View
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Viewing data for <strong>{format(selectedDate, 'dd MMM yyyy')}</strong>, not today.
          </p>
        </div>
      </div>
    </div>
  );
}
