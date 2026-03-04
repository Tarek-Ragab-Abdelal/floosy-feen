'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
            {content}
          </div>
          <div className="w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}

export function HelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        aria-label="Show help"
        className="text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}
