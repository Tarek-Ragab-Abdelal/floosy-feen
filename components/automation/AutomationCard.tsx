import React, { useState } from 'react';
import { Zap, MoreVertical, Edit, Pause, Play, Trash2 } from 'lucide-react';
import { Automation } from '@/types/domain';

interface AutomationCardProps {
  automation: Automation;
  onEdit?: (automation: Automation) => void;
  onToggleActive?: (automationId: string, isActive: boolean) => void;
  onDelete?: (automationId: string) => void;
}

export function AutomationCard({ automation, onEdit, onToggleActive, onDelete }: Readonly<AutomationCardProps>) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState<'now' | 'after'>('now');
  const [iterationsToKeep, setIterationsToKeep] = useState('0');

  const handleEditClick = () => {
    setShowMenu(false);
    onEdit?.(automation);
  };

  const handleToggleActiveClick = () => {
    setShowMenu(false);
    onToggleActive?.(automation.id, !automation.isActive);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteOption === 'after') {
      // For now, just delete - in a full implementation, this would keep N iterations
      console.log(`Delete automation after ${iterationsToKeep} iterations`);
    }
    onDelete?.(automation.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              {automation.requiresConfirmation && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Manual
                </span>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                automation.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {automation.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            
            {(onEdit || onToggleActive || onDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Automation options"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {showMenu && (
                  <>
                    <button 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1">
                      {onEdit && (
                        <button
                          onClick={handleEditClick}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      {onToggleActive && (
                        <button
                          onClick={handleToggleActiveClick}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                        >
                          {automation.isActive ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Resume
                            </>
                          )}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={handleDeleteClick}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{automation.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 capitalize">
          {automation.type.replace('_', ' ')}
        </p>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">
              {automation.currency} {automation.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Frequency:</span>
            <span className="capitalize">
              {automation.schedule.frequency}
              {automation.schedule.day ? ` (Day ${automation.schedule.day})` : ''}
            </span>
          </div>
          {automation.schedule.startDate && (
            <div className="flex justify-between">
              <span>Starts:</span>
              <span>{new Date(automation.schedule.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {automation.schedule.endDate && (
            <div className="flex justify-between">
              <span>Ends:</span>
              <span>{new Date(automation.schedule.endDate).toLocaleDateString()}</span>
            </div>
          )}
          {automation.schedule.occurrences && (
            <div className="flex justify-between">
              <span>Occurrences:</span>
              <span>{automation.schedule.occurrences}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delete "{automation.name}"?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              What would you like to do with future projected transactions?
            </p>

            <div className="space-y-3 mb-6">
              <label 
                className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="End now"
              >
                <input
                  type="radio"
                  name="deleteOption"
                  value="now"
                  checked={deleteOption === 'now'}
                  onChange={(e) => setDeleteOption(e.target.value as 'now' | 'after')}
                  className="mt-1 w-4 h-4 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">End now</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Delete the automation and remove all future projections
                  </div>
                </div>
              </label>

              <label 
                className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                aria-label="Keep next iterations"
              >
                <input
                  type="radio"
                  name="deleteOption"
                  value="after"
                  checked={deleteOption === 'after'}
                  onChange={(e) => setDeleteOption(e.target.value as 'now' | 'after')}
                  className="mt-1 w-4 h-4 text-emerald-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">Keep next iterations</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Delete after specific number of occurrences
                  </div>
                  {deleteOption === 'after' && (
                    <input
                      type="number"
                      min="0"
                      value={iterationsToKeep}
                      onChange={(e) => setIterationsToKeep(e.target.value)}
                      placeholder="Number of iterations"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
