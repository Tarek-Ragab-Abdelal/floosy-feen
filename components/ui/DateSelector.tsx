'use client';

import React from 'react';
import { useDate } from '@/contexts/DateContext';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export function DateSelector() {
  const { selectedDate, setSelectedDate } = useDate();

  const presets = [
    { label: 'Today', date: new Date() },
  ];

  return (
    <div className="max-w-screen flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <Calendar className="mr-2 w-5 h-5 text-emerald-600 dark:text-emerald-400" />

      <div className="flex space-x-2">
        {presets.map(p => (
          <button
        key={p.label}
        onClick={() => setSelectedDate(p.date)}
        className={`px-3 py-1 rounded-lg text-sm font-medium ${format(selectedDate, 'yyyy-MM-dd') === format(p.date, 'yyyy-MM-dd') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}
          >
        {p.label}
          </button>
        ))}
      </div>
      <input
        type="date"
        value={format(selectedDate, 'yyyy-MM-dd')}
        min={format(new Date(), 'yyyy-MM-dd')}
        onChange={(e) => setSelectedDate(new Date(e.target.value))}
        className="ml-4 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-sm"
      />
    </div>
  );
}
