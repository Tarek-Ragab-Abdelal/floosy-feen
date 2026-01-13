import { Automation } from '@/types/domain';

/**
 * Lightweight automation runner used by UI or scheduled job.
 * This service is repository-agnostic: caller should pass repository instances.
 */
import { AutomationRepository } from '@/repositories/automation.repository';
import { TransactionRepository } from '@/repositories/transaction.repository';
import { StreamRepository } from '@/repositories/stream.repository';

export async function runAutomationsForDate(repos: {
  automationRepo: AutomationRepository;
  transactionRepo: TransactionRepository;
  streamRepo?: StreamRepository;
}, date: Date) {
  const automations: Automation[] = await repos.automationRepo.findAll();

  for (const automation of automations) {
    if (!automation.isActive) continue;

    const schedule = automation.schedule || { frequency: 'manual' };

    // Only support monthly schedules (by day) and transfers/salary basic flows for now
    if (schedule.frequency === 'monthly') {
      const day = schedule.day;
      if (typeof day === 'number') {
        if (date.getDate() !== day) continue;
      } else {
        // If no specific day specified, skip (or we could default to createdAt day)
        continue;
      }

      // Avoid double-run for same day
      if (automation.lastRunAt) {
        const last = new Date(automation.lastRunAt);
        if (last.getFullYear() === date.getFullYear() && last.getMonth() === date.getMonth() && last.getDate() === date.getDate()) {
          continue; // already run today
        }
      }

      // Execute automation based on type
      try {
        const inferCurrency = async (streamId?: string) => {
          if (automation.currency) return automation.currency;
          if (!repos.streamRepo || !streamId) return 'EGP';
          const s = await repos.streamRepo.findById(streamId);
          return s?.baseCurrency || 'EGP';
        };
        if (automation.type === 'salary') {
          if (automation.targetStreamId) {
            const currency = await inferCurrency(automation.targetStreamId);
            await repos.transactionRepo.create({
              type: 'income',
              amount: automation.amount,
              currency,
              streamId: automation.targetStreamId,
              applicabilityDate: date,
              tags: [],
              description: automation.name,
              recurrenceId: null,
            });
          }
        } else if (automation.type === 'transfer') {
          // create expense on source and income on target
          if (automation.sourceStreamId) {
            const currency = await inferCurrency(automation.sourceStreamId);
            await repos.transactionRepo.create({
              type: 'expense',
              amount: automation.amount,
              currency,
              streamId: automation.sourceStreamId,
              applicabilityDate: date,
              tags: [],
              description: automation.name,
              recurrenceId: null,
            });
          }

          if (automation.targetStreamId) {
            const currency = await inferCurrency(automation.targetStreamId);
            await repos.transactionRepo.create({
              type: 'income',
              amount: automation.amount,
              currency,
              streamId: automation.targetStreamId,
              applicabilityDate: date,
              tags: [],
              description: automation.name,
              recurrenceId: null,
            });
          }
        } else if (automation.type === 'cc_payment') {
          // For cc_payment we assume source is bank and target is credit card
          if (automation.sourceStreamId && automation.targetStreamId) {
            const srcCurrency = await inferCurrency(automation.sourceStreamId);
            const dstCurrency = await inferCurrency(automation.targetStreamId);

            // debit bank
            await repos.transactionRepo.create({
              type: 'expense',
              amount: automation.amount,
              currency: srcCurrency,
              streamId: automation.sourceStreamId,
              applicabilityDate: date,
              tags: [],
              description: automation.name,
              recurrenceId: null,
            });

            // pay credit card (income into card reduces usage)
            await repos.transactionRepo.create({
              type: 'income',
              amount: automation.amount,
              currency: dstCurrency,
              streamId: automation.targetStreamId,
              applicabilityDate: date,
              tags: [],
              description: automation.name,
              recurrenceId: null,
            });
          }
        }

        // Update automation lastRunAt
        await repos.automationRepo.update(automation.id, { lastRunAt: date });
      } catch (err) {
        console.error('Error running automation', automation.id, err);
      }
    }
  }
}

export default { runAutomationsForDate };
