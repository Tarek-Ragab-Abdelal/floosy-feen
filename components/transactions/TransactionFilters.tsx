import React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Stream } from '@/types/domain';
import { format } from 'date-fns';

interface TransactionFiltersProps {
  filterType: 'all' | 'income' | 'expense';
  filterStream: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  showFilters: boolean;
  streams: Stream[];
  onFilterTypeChange: (type: 'all' | 'income' | 'expense') => void;
  onFilterStreamChange: (streamId: string) => void;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
  onToggleFilters: () => void;
}

export function TransactionFilters({
  filterType,
  filterStream,
  dateFrom,
  dateTo,
  showFilters,
  streams,
  onFilterTypeChange,
  onFilterStreamChange,
  onDateFromChange,
  onDateToChange,
  onToggleFilters,
}: Readonly<TransactionFiltersProps>) {
  const hasActiveFilters = filterType !== 'all' || filterStream !== 'all' || dateFrom || dateTo;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggleFilters}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 rounded-full">
              Active
            </span>
          )}
        </div>
        {showFilters ? (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
      
      {showFilters && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onFilterTypeChange('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => onFilterTypeChange('income')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => onFilterTypeChange('expense')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterType === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
            
            {/* Stream Filter */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stream
              </span>
              <select
                value={filterStream}
                onChange={(e) => onFilterStreamChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Streams</option>
                {streams.map(stream => (
                  <option key={stream.id} value={stream.id}>{stream.name}</option>
                ))}
              </select>
            </div>
            
            {/* Date From */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom ? format(dateFrom, 'yyyy-MM-dd') : ''}
                  onChange={(e) => onDateFromChange(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 pr-8 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {dateFrom && (
                  <button
                    onClick={() => onDateFromChange(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date To */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo ? format(dateTo, 'yyyy-MM-dd') : ''}
                  onChange={(e) => onDateToChange(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full px-3 py-2 pr-8 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {dateTo && (
                  <button
                    onClick={() => onDateToChange(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
