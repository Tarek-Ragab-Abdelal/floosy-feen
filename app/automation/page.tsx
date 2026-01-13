'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { Automation, Stream } from '@/types/domain';
import { HelpCircle, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AutomationsSection } from '@/components/automation/AutomationsSection';

export default function AutomationPage() {
  const { automationRepo, streamRepo, isInitialized } = useRepositories();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Automation['type']>('salary');
  const [amount, setAmount] = useState('');
  const [sourceStreamId, setSourceStreamId] = useState('');
  const [targetStreamId, setTargetStreamId] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'manual'>('monthly');
  const [day, setDay] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [occurrences, setOccurrences] = useState('');
  const [hasOccurrences, setHasOccurrences] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  
  // Saving circle specific
  const [totalOccurrences, setTotalOccurrences] = useState('12');
  const [earningMonths, setEarningMonths] = useState<Array<{ occurrence: number; portion: number }>>([]);

  useEffect(() => {
    if (!isInitialized) return;
    loadData();
  }, [isInitialized]);

  const loadData = async () => {
    try {
      const [autos, strms] = await Promise.all([
        automationRepo.findAll(),
        streamRepo.findActive(),
      ]);
      setAutomations(autos);
      setStreams(strms);
    } catch (error) {
      console.error('Error loading automation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setType('salary');
    setAmount('');
    setSourceStreamId('');
    setTargetStreamId('');
    setFrequency('monthly');
    setDay('1');
    setStartDate('');
    setEndDate('');
    setHasEndDate(false);
    setOccurrences('');
    setHasOccurrences(false);
    setRequiresConfirmation(false);
    setTotalOccurrences('12');
    setEarningMonths([]);
    setCurrentStep(1);
    setEditingAutomation(null);
  };

  const loadFormFromAutomation = (auto: Automation) => {
    setName(auto.name);
    setType(auto.type);
    setAmount(String(auto.amount));
    setSourceStreamId(auto.sourceStreamId || '');
    setTargetStreamId(auto.targetStreamId || '');
    setFrequency(auto.schedule.frequency);
    setDay(String(auto.schedule.day || 1));
    setStartDate(auto.schedule.startDate ? new Date(auto.schedule.startDate).toISOString().split('T')[0] : '');
    setEndDate(auto.schedule.endDate ? new Date(auto.schedule.endDate).toISOString().split('T')[0] : '');
    setHasEndDate(!!auto.schedule.endDate);
    setOccurrences(String(auto.schedule.occurrences || ''));
    setHasOccurrences(!!auto.schedule.occurrences);
    setRequiresConfirmation(auto.requiresConfirmation);
    setTotalOccurrences(String(auto.savingCircle?.totalOccurrences || 12));
    setEarningMonths(auto.savingCircle?.earningSchedule || []);
  };

  const getSelectedStreamCurrency = () => {
    const streamId = type === 'salary' ? targetStreamId : sourceStreamId;
    const stream = streams.find(s => s.id === streamId);
    return stream?.baseCurrency || 'EGP';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const currency = getSelectedStreamCurrency();
       
       const automationData = {
         name,
         type,
         amount: Number.parseFloat(amount) || 0,
         currency,
         sourceStreamId: sourceStreamId || undefined,
         targetStreamId: targetStreamId || undefined,
         schedule: {
           frequency,
           day: Number.parseInt(day),
           startDate: startDate ? new Date(startDate) : undefined,
           endDate: hasEndDate && endDate ? new Date(endDate) : null,
           occurrences: hasOccurrences && occurrences ? Number.parseInt(occurrences) : undefined,
         },
         savingCircle: type === 'saving_circle' ? {
           totalOccurrences: Number.parseInt(totalOccurrences),
           earningSchedule: earningMonths.length > 0 ? earningMonths : undefined,
         } : undefined,
         isActive: true,
         requiresConfirmation,
       };

       if (editingAutomation) {
         await automationRepo.update(editingAutomation.id, automationData);
         alert('Automation updated!');
       } else {
         await automationRepo.create(automationData);
         alert('Automation created!');
       }
       
       setIsModalOpen(false);
       resetForm();
       loadData();
    } catch (error) {
      console.error('Failed to save automation', error);
      alert('Failed to save automation');
    }
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    loadFormFromAutomation(automation);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (automationId: string, isActive: boolean) => {
    try {
      const automation = automations.find(a => a.id === automationId);
      if (automation) {
        await automationRepo.update(automationId, {
          ...automation,
          isActive,
        });
        loadData();
      }
    } catch (error) {
      console.error('Failed to toggle automation', error);
      alert('Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      await automationRepo.delete(automationId);
      loadData();
    } catch (error) {
      console.error('Failed to delete automation', error);
      alert('Failed to delete automation');
    }
  };

  const canProceedToStep2 = () => {
    return type && name.trim() && amount.trim();
  };

  const canProceedToStep3 = () => {
    if (type === 'salary') return targetStreamId;
    if (type === 'installment' || type === 'saving_circle') return sourceStreamId;
    if (type === 'transfer' || type === 'cc_payment') return sourceStreamId && targetStreamId;
    return false;
  };

  if (isLoading) {
      return (
          <AppLayout>
              <div className="flex justify-center items-center h-screen">Loading...</div>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
         <div className="lg:pt-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Automations
              </h1>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowHelp(true)}
                  onMouseLeave={() => setShowHelp(false)}
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
                {showHelp && (
                  <>
                    <button 
                      className="fixed inset-0 z-40 md:hidden" 
                      onClick={() => setShowHelp(false)}
                    />
                    <div className="fixed md:absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-y-0 md:top-8 z-50 w-[calc(100vw-2rem)] max-w-80 md:w-80 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">About Automations</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automations help you set up recurring transactions like salaries, installments, transfers, and saving circles. Once configured, they automatically generate projected transactions based on your schedule.
                      </p>
                    </div>
                  </> 
                )}
              </div>
            </div>
         </div>

         {/* Automations Section */}
         <AutomationsSection
           automations={automations}
           onCreateAutomation={() => setIsModalOpen(true)}
           onEditAutomation={handleEditAutomation}
           onToggleActive={handleToggleActive}
           onDeleteAutomation={handleDeleteAutomation}
         />

         {/* Create/Edit Automation Modal - Step-by-Step Wizard */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            title={editingAutomation ? 'Edit Automation' : 'Create Automation'}
         >
            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`h-1 flex-1 mx-2 ${
                        currentStep > step ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {currentStep === 1 && "What type of automation?"}
                {currentStep === 2 && "Select account(s)"}
                {currentStep === 3 && "Set schedule"}
                {currentStep === 4 && "Review & confirm"}
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
               {/* Step 1: Type, Name, Amount */}
               {currentStep === 1 && (
                 <div className="space-y-4">
                   <div>
                      <span className="block text-sm font-medium mb-2">Automation Type</span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: 'salary', label: 'Salary', desc: 'Regular income deposit', icon: '💰' },
                          { value: 'installment', label: 'Installment', desc: 'Fixed payment plan', icon: '📅' },
                          { value: 'transfer', label: 'Auto Transfer', desc: 'Move money between accounts', icon: '↔️' },
                          { value: 'saving_circle', label: 'Saving Circle', desc: 'Group saving plan', icon: '🔄' },
                          { value: 'cc_payment', label: 'Credit Card Payment', desc: 'Automatic CC payment', icon: '💳' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setType(option.value as Automation['type'])}
                            className={`p-3 text-left rounded-lg border-2 transition-all ${
                              type === option.value
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                              </div>
                              {type === option.value && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            </div>
                          </button>
                        ))}
                      </div>
                   </div>

                   <div>
                      <span className="block text-sm font-medium mb-1">Name</span>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600"
                        placeholder="e.g. Monthly Salary"
                        required
                      />
                   </div>

                   <div>
                      <span className="block text-sm font-medium mb-1">Amount</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Currency will be set based on selected account</p>
                   </div>
                 </div>
               )}

               {/* Step 2: Accounts */}
               {currentStep === 2 && (
                 <div className="space-y-4">
                   {type === 'salary' && (
                       <div>
                          <span className="block text-sm font-medium mb-2">Which account receives this income?</span>
                          <div className="space-y-2">
                            {streams.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setTargetStreamId(s.id)}
                                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                  targetStreamId === s.id
                                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                    <div className="text-sm text-gray-500">{s.baseCurrency}</div>
                                  </div>
                                  {targetStreamId === s.id && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                </div>
                              </button>
                            ))}
                          </div>
                       </div>
                   )}
                   
                   {(type === 'installment' || type === 'saving_circle') && (
                       <div>
                          <span className="block text-sm font-medium mb-2">Which account pays this?</span>
                          <div className="space-y-2">
                            {streams.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSourceStreamId(s.id)}
                                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                  sourceStreamId === s.id
                                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                    <div className="text-sm text-gray-500">{s.baseCurrency}</div>
                                  </div>
                                  {sourceStreamId === s.id && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                </div>
                              </button>
                            ))}
                          </div>
                       </div>
                   )}

                   {(type === 'transfer' || type === 'cc_payment') && (
                       <>
                         <div>
                            <span className="block text-sm font-medium mb-2">From Account</span>
                            <div className="space-y-2">
                              {streams.map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSourceStreamId(s.id)}
                                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                    sourceStreamId === s.id
                                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                      <div className="text-sm text-gray-500">{s.baseCurrency}</div>
                                    </div>
                                    {sourceStreamId === s.id && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                  </div>
                                </button>
                              ))}
                            </div>
                         </div>
                         <div>
                            <span className="block text-sm font-medium mb-2">To Account</span>
                            <div className="space-y-2">
                              {streams.map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setTargetStreamId(s.id)}
                                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                    targetStreamId === s.id
                                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                                  }`}
                                  disabled={s.id === sourceStreamId}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                      <div className="text-sm text-gray-500">{s.baseCurrency}</div>
                                    </div>
                                    {targetStreamId === s.id && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                  </div>
                                </button>
                              ))}
                            </div>
                         </div>
                       </>
                   )}
                 </div>
               )}

               {/* Step 3: Schedule */}
               {currentStep === 3 && (
                 <div className="space-y-4">
                   <div>
                      <span className="block text-sm font-medium mb-2">How often?</span>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { value: 'monthly', label: 'Monthly', desc: 'Every month on specific day' },
                          { value: 'weekly', label: 'Weekly', desc: 'Every week' },
                          { value: 'manual', label: 'Manual', desc: 'I\'ll trigger it myself' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFrequency(option.value as 'monthly' | 'weekly' | 'manual')}
                            className={`p-3 text-left rounded-lg border-2 transition-all ${
                              frequency === option.value
                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                              </div>
                              {frequency === option.value && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                            </div>
                          </button>
                        ))}
                      </div>
                   </div>

                   {frequency === 'monthly' && (
                      <div>
                        <span className="block text-sm font-medium mb-1">Day of Month</span>
                        <input 
                           type="number" 
                           min="1" 
                           max="31" 
                           value={day} 
                           onChange={e => setDay(e.target.value)}
                           className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600" 
                           placeholder="Day (1-31)"
                        />
                      </div>
                   )}
                   
                   <div>
                      <span className="block text-sm font-medium mb-1">Start Date (Optional)</span>
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to start now</p>
                   </div>
                   
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="hasEndDate"
                          checked={hasEndDate}
                          onChange={(e) => setHasEndDate(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <label htmlFor="hasEndDate" className="text-sm font-medium">Set End Date</label>
                      </div>
                      {hasEndDate && (
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={e => setEndDate(e.target.value)} 
                          className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600"
                        />
                      )}
                   </div>
                   
                   {(type === 'installment' || type === 'saving_circle') && (
                     <div>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            id="hasOccurrences"
                            checked={hasOccurrences}
                            onChange={(e) => setHasOccurrences(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <label htmlFor="hasOccurrences" className="text-sm font-medium">Limit Number of Payments</label>
                        </div>
                        {hasOccurrences && (
                          <input 
                            type="number" 
                            min="1"
                            value={occurrences} 
                            onChange={e => setOccurrences(e.target.value)} 
                            className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-gray-600"
                            placeholder="e.g., 12 for 12 months"
                          />
                        )}
                     </div>
                   )}
                   
                   {type === 'saving_circle' && (
                     <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                       <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">Saving Circle Settings</h4>
                       <div>
                         <span className="block text-sm font-medium mb-1">Total Participants</span>
                         <input 
                           type="number" 
                           min="1"
                           value={totalOccurrences} 
                           onChange={e => setTotalOccurrences(e.target.value)} 
                           className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                           placeholder="e.g., 12"
                         />
                       </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Step 4: Review & Confirmation */}
               {currentStep === 4 && (
                 <div className="space-y-4">
                   <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-3">
                     <h3 className="font-semibold text-gray-900 dark:text-white">Review Your Automation</h3>
                     
                     <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Type:</span>
                         <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Name:</span>
                         <span className="font-medium">{name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                         <span className="font-medium">{getSelectedStreamCurrency()} {amount}</span>
                       </div>
                       {sourceStreamId && (
                         <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">From:</span>
                           <span className="font-medium">{streams.find(s => s.id === sourceStreamId)?.name}</span>
                         </div>
                       )}
                       {targetStreamId && (
                         <div className="flex justify-between">
                           <span className="text-gray-600 dark:text-gray-400">To:</span>
                           <span className="font-medium">{streams.find(s => s.id === targetStreamId)?.name}</span>
                         </div>
                       )}
                       <div className="flex justify-between">
                         <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                         <span className="font-medium capitalize">{frequency} {frequency === 'monthly' && `(Day ${day})`}</span>
                       </div>
                     </div>
                   </div>

                   <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                     <div className="flex items-start gap-3">
                       <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                       <div className="flex-1">
                         <h4 className="font-medium text-sm text-amber-900 dark:text-amber-100 mb-1">
                           Manual Confirmation
                         </h4>
                         <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                           Do you want to manually confirm each occurrence before it's applied? This is useful for installments or transactions that aren't automatically deducted.
                         </p>
                         <span className="flex items-center gap-2">
                           <input
                             type="checkbox"
                             checked={requiresConfirmation}
                             onChange={(e) => setRequiresConfirmation(e.target.checked)}
                             className="w-4 h-4 text-emerald-600 rounded"
                           />
                           <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                             Yes, I want to manually confirm each occurrence
                           </span>
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {/* Navigation Buttons */}
               <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
                 {currentStep > 1 && (
                   <button
                     type="button"
                     onClick={() => setCurrentStep(currentStep - 1)}
                     className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                   >
                     <ChevronLeft className="w-4 h-4" />
                     Back
                   </button>
                 )}
                 
                 {currentStep < 4 ? (
                   <button
                     type="button"
                     onClick={() => setCurrentStep(currentStep + 1)}
                     disabled={currentStep === 1 ? !canProceedToStep2() : !canProceedToStep3()}
                     className="flex items-center gap-2 ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                   >
                     Next
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 ) : (
                   <button
                     type="submit"
                     className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                   >
                     Create Automation
                   </button>
                 )}
               </div>
            </form>
         </Modal>
      </div>
    </AppLayout>
  );
}
