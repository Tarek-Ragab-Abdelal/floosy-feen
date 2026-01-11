import React from 'react';
import { Plus, Zap } from 'lucide-react';
import { Automation } from '@/types/domain';
import { AutomationCard } from './AutomationCard';

interface AutomationsSectionProps {
  automations: Automation[];
  onCreateAutomation: () => void;
  onEditAutomation?: (automation: Automation) => void;
  onToggleActive?: (automationId: string, isActive: boolean) => void;
  onDeleteAutomation?: (automationId: string) => void;
}

export function AutomationsSection({ 
  automations, 
  onCreateAutomation, 
  onEditAutomation,
  onToggleActive,
  onDeleteAutomation 
}: Readonly<AutomationsSectionProps>) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Automations
        </h2>
        <button
          onClick={onCreateAutomation}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Create Automation</span>
        </button>
      </div>
      
      {automations.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
              <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Automations Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Set up recurring transactions to automate your financial planning. Create salary deposits, installment payments, transfers, and more.
            </p>
            <button
              onClick={onCreateAutomation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
            >
              Create Your First Automation
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map(automation => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onEdit={onEditAutomation}
              onToggleActive={onToggleActive}
              onDelete={onDeleteAutomation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
