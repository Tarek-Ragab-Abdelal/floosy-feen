'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRepositories } from '@/contexts/RepositoryContext';
import { Automation, Stream } from '@/types/domain';
import { Plus, Zap, ArrowRight, Calendar, Settings } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CurrencySelector } from '@/components/ui/CurrencySelector';

export default function AutomationPage() {
  const { automationRepo, streamRepo, isInitialized } = useRepositories();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Automation['type']>('salary');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [sourceStreamId, setSourceStreamId] = useState('');
  const [targetStreamId, setTargetStreamId] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'manual'>('monthly');
  const [day, setDay] = useState('1'); // Day of month

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
      if (strms.length > 0) {
          setCurrency(strms[0].baseCurrency);
      }
    } catch (error) {
      console.error('Error loading automation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       await automationRepo.create({
         name,
         type,
         amount: parseFloat(amount) || 0,
         currency,
         sourceStreamId: sourceStreamId || undefined,
         targetStreamId: targetStreamId || undefined,
         schedule: {
           frequency,
           day: parseInt(day),
         },
         isActive: true,
       });
       setIsModalOpen(false);
       loadData();
       alert('Automation created!');
    } catch (error) {
      console.error('Failed to create automation', error);
      alert('Failed to create automation');
    }
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
         <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Automations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage recurring transfers, salaries, and smart rules
              </p>
            </div>
            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 hover:shadow-lg transition-all"
            >
               <Plus className="w-5 h-5" />
               <span className="hidden sm:inline">New Automation</span>
            </button>
         </div>

         {/* List */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {automations.map(auto => (
              <div key={auto.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                 <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                       <Zap className="w-6 h-6" />
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${auto.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {auto.isActive ? 'Active' : 'Paused'}
                    </span>
                 </div>
                 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{auto.name}</h3>
                 <p className="text-sm text-gray-500 mb-4 capitalize">Type: {auto.type.replace('_', ' ')}</p>
                 
                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between">
                       <span>Amount:</span>
                       <span className="font-medium">{auto.currency} {auto.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                       <span>Frequency:</span>
                       <span className="capitalize">{auto.schedule.frequency} {auto.schedule.day ? `(Day ${auto.schedule.day})` : ''}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>

         {/* Modal */}
         <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Create Automation"
         >
            <form onSubmit={handleCreate} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                  >
                     <option value="salary">Salary (Income)</option>
                     <option value="transfer">Auto Transfer</option>
                     <option value="saving_circle">Saving Circle</option>
                     <option value="cc_payment">Credit Card Payment</option>
                  </select>
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                    placeholder="e.g. Monthly Salary"
                    required
                  />
               </div>

               <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                    placeholder="0.00"
                    required
                  />
               </div>

                <CurrencySelector value={currency} onChange={setCurrency} />

               {type === 'salary' && (
                   <div>
                      <label className="block text-sm font-medium mb-1">Target Account</label>
                      <select 
                        value={targetStreamId} 
                        onChange={e => setTargetStreamId(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                        required
                      >
                         <option value="">Select Account...</option>
                         {streams.map(s => <option key={s.id} value={s.id}>{s.name} ({s.baseCurrency})</option>)}
                      </select>
                   </div>
               )}

               {(type === 'transfer' || type === 'cc_payment') && (
                   <>
                     <div>
                        <label className="block text-sm font-medium mb-1">From Account</label>
                        <select 
                            value={sourceStreamId} 
                            onChange={e => setSourceStreamId(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select Source...</option>
                            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">To Account</label>
                        <select 
                            value={targetStreamId} 
                            onChange={e => setTargetStreamId(e.target.value)}
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                            required
                        >
                            <option value="">Select Target...</option>
                            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                     </div>
                   </>
               )}

               <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <div className="flex gap-2">
                     <select 
                        value={frequency} 
                        onChange={(e) => setFrequency(e.target.value as any)}
                        className="flex-1 p-2 border rounded dark:bg-slate-700 dark:border-gray-600"
                     >
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="manual">Manual Trigger</option>
                     </select>
                     {frequency === 'monthly' && (
                        <input 
                           type="number" 
                           min="1" 
                           max="31" 
                           value={day} 
                           onChange={e => setDay(e.target.value)}
                           className="w-20 p-2 border rounded dark:bg-slate-700 dark:border-gray-600" 
                           placeholder="Day"
                        />
                     )}
                  </div>
               </div>

               <button className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
                  Create Automation
               </button>
            </form>
         </Modal>
      </div>
    </AppLayout>
  );
}
