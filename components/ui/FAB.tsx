'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

export function FAB({ onClick, icon, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 z-40 flex items-center justify-center gap-2 
                 w-14 h-14 rounded-full 
                 sm:w-auto sm:h-auto sm:px-6 sm:py-4 sm:rounded-full
                 bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:bg-emerald-700 
                 transition-all duration-300 safe-bottom"
      aria-label={label || 'Add'}
    >
      <div className="flex items-center justify-center">
        {icon || <Plus className="w-6 h-6 sm:w-5 sm:h-5" />}
      </div>
      {label && <span className="font-medium hidden sm:inline">{label}</span>}
    </button>
  );
}
