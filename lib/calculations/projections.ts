// Projection Generation Utilities

import { Recurrence, Transaction, Automation, Stream } from '@/types/domain';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from 'date-fns';

export interface ProjectedTransaction extends Omit<Transaction, 'id' | 'createdAt'> {
  isProjected: true;
  projectionDate: Date;
}

const MAX_PROJECTION_YEARS = 2;

/**
 * Generate projected transaction instances from a recurrence rule
 */
export function generateRecurrenceInstances(
  recurrence: Recurrence,
  fromDate: Date,
  toDate: Date
): ProjectedTransaction[] {
  const instances: ProjectedTransaction[] = [];
  
  // Limit projection to 2 years from now
  const maxDate = addYears(new Date(), MAX_PROJECTION_YEARS);
  const effectiveToDate = toDate > maxDate ? maxDate : toDate;

  // Determine the first occurrence we should start generating from
  let currentDate = getFirstOccurrence(recurrence, fromDate);

  // Generate instances
  while (isBefore(currentDate, effectiveToDate) || currentDate.getTime() === effectiveToDate.getTime()) {
    // Check if we've passed the end date
    if (recurrence.endDate && isAfter(currentDate, recurrence.endDate)) {
      break;
    }

    instances.push({
      streamId: recurrence.streamId,
      amount: recurrence.amount,
      currency: '', // Will be filled by stream currency
      applicabilityDate: new Date(currentDate),
      type: recurrence.type,
      tags: recurrence.tags,
      recurrenceId: recurrence.id,
      description: recurrence.description,
      isProjected: true,
      projectionDate: new Date(),
    });

    currentDate = getNextOccurrence(currentDate, recurrence);
  }

  return instances;
}

/**
 * Get the next occurrence date based on frequency
 */
function getNextOccurrence(currentDate: Date, recurrence: Recurrence): Date {
  switch (recurrence.frequency) {
    case 'daily':
      return addDays(currentDate, 1);
    
    case 'weekly':
      return addWeeks(currentDate, 1);
    
    case 'monthly':
      // If dayOfMonth is specified, compute next month with that day
      if (recurrence.dayOfMonth && recurrence.dayOfMonth > 0) {
        const nextMonth = addMonths(currentDate, 1);
        return getMonthlyDateWithDay(nextMonth, recurrence.dayOfMonth);
      }

      return addMonths(currentDate, 1);
    
    case 'yearly':
      return addYears(currentDate, 1);
    
    case 'custom':
      return addDays(currentDate, recurrence.customIntervalDays || 1);
    
    default:
      return addDays(currentDate, 1);
  }
}

/**
 * Compute the proper date in the given month that corresponds to dayOfMonth.
 * If the requested day exceeds number of days in month, use the month's last day.
 */
function getMonthlyDateWithDay(baseDate: Date, day: number): Date {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  // Start with requested day
  const candidate = new Date(year, month, day);

  // If month rolled over (e.g., day 31 in shorter month), use last day of month
  if (candidate.getMonth() !== month) {
    // last day of month
    return new Date(year, month + 1, 0);
  }

  return candidate;
}

/**
 * Calculate the first occurrence for generation based on recurrence and the fromDate.
 * - If recurrence has explicit dayOfMonth and is monthly, align to that day.
 * - Otherwise start from recurrence.startDate or fast-forward to fromDate.
 */
function getFirstOccurrence(recurrence: Recurrence, fromDate: Date): Date {
  const start = new Date(recurrence.startDate);

  if (recurrence.frequency === 'monthly' && recurrence.dayOfMonth && recurrence.dayOfMonth > 0) {
    // Build candidate in start month
    let candidate = getMonthlyDateWithDay(start, recurrence.dayOfMonth);

    // If candidate is before the start date, move to next month
    if (candidate < start) {
      const next = addMonths(start, 1);
      candidate = getMonthlyDateWithDay(next, recurrence.dayOfMonth);
    }

    // Fast-forward until candidate is >= fromDate
    while (isBefore(candidate, fromDate)) {
      const next = addMonths(candidate, 1);
      candidate = getMonthlyDateWithDay(next, recurrence.dayOfMonth);
    }

    return candidate;
  }

  // Fallback behavior: start from recurrence.startDate and fast-forward normally
  let current = new Date(recurrence.startDate);
  while (isBefore(current, fromDate)) {
    current = getNextOccurrence(current, recurrence);
  }

  return current;
}

/**
 * Generate all projections from multiple recurrences
 */
export function generateAllProjections(
  recurrences: Recurrence[],
  fromDate: Date,
  toDate: Date
): ProjectedTransaction[] {
  const allProjections: ProjectedTransaction[] = [];

  for (const recurrence of recurrences) {
    const instances = generateRecurrenceInstances(recurrence, fromDate, toDate);
    allProjections.push(...instances);
  }

  return allProjections.sort(
    (a, b) => a.applicabilityDate.getTime() - b.applicabilityDate.getTime()
  );
}

/**
 * Generate projection instances for automations. Requires streams list to infer currencies.
 */
export function generateAutomationInstances(
  automations: Automation[],
  streams: Stream[],
  fromDate: Date,
  toDate: Date
): ProjectedTransaction[] {
  const instances: ProjectedTransaction[] = [];

  for (const automation of automations) {
    if (!automation.isActive) continue;

    // Only support monthly scheduled automations for projection
    if (automation.schedule.frequency !== 'monthly') continue;

    const day = automation.schedule.day;
    if (typeof day !== 'number') continue;

    // build a starting date aligned to fromDate or automation.createdAt
    let current = new Date(automation.createdAt || new Date());
    // align to the requested day in the month containing createdAt
    current = new Date(current.getFullYear(), current.getMonth(), Math.min(day, 28));

    // fast-forward until >= fromDate
    while (current < fromDate) {
      current = addMonths(current, 1);
      current = new Date(current.getFullYear(), current.getMonth(), Math.min(day, 31));
    }

    // generate until toDate (but cap to 2 years similar to recurrences)
    const maxDate = addYears(new Date(), MAX_PROJECTION_YEARS);
    const effectiveToDate = toDate > maxDate ? maxDate : toDate;

    while (current <= effectiveToDate) {
      // Determine transactions depending on automation type
      const projectionDate = new Date(current);

      // Determine currency for this automation: prefer automation.currency, else infer from stream
      const getStreamCurrency = (streamId?: string) => {
        if (!streamId) return undefined;
        const s = streams.find(x => x.id === streamId);
        return s?.baseCurrency;
      };

      const currency = automation.currency || getStreamCurrency(automation.targetStreamId) || getStreamCurrency(automation.sourceStreamId) || 'USD';

      if (automation.type === 'salary') {
        if (automation.targetStreamId) {
          instances.push({
            streamId: automation.targetStreamId,
            amount: automation.amount,
            currency,
            applicabilityDate: new Date(projectionDate),
            type: 'income',
            tags: [],
            recurrenceId: automation.id,
            description: automation.name,
            isProjected: true,
            projectionDate: new Date(),
          });
        }
      } else if (automation.type === 'transfer') {
        if (automation.sourceStreamId) {
          instances.push({
            streamId: automation.sourceStreamId,
            amount: automation.amount,
            currency,
            applicabilityDate: new Date(projectionDate),
            type: 'expense',
            tags: [],
            recurrenceId: automation.id,
            description: automation.name,
            isProjected: true,
            projectionDate: new Date(),
          });
        }
        if (automation.targetStreamId) {
          instances.push({
            streamId: automation.targetStreamId,
            amount: automation.amount,
            currency,
            applicabilityDate: new Date(projectionDate),
            type: 'income',
            tags: [],
            recurrenceId: automation.id,
            description: automation.name,
            isProjected: true,
            projectionDate: new Date(),
          });
        }
      } else if (automation.type === 'cc_payment') {
        if (automation.sourceStreamId) {
          instances.push({
            streamId: automation.sourceStreamId,
            amount: automation.amount,
            currency,
            applicabilityDate: new Date(projectionDate),
            type: 'expense',
            tags: [],
            recurrenceId: automation.id,
            description: automation.name,
            isProjected: true,
            projectionDate: new Date(),
          });
        }
        if (automation.targetStreamId) {
          instances.push({
            streamId: automation.targetStreamId,
            amount: automation.amount,
            currency,
            applicabilityDate: new Date(projectionDate),
            type: 'income',
            tags: [],
            recurrenceId: automation.id,
            description: automation.name,
            isProjected: true,
            projectionDate: new Date(),
          });
        }
      }

      // advance one month
      current = addMonths(current, 1);
      // normalize day-of-month
      current = new Date(current.getFullYear(), current.getMonth(), Math.min(day, 31));
    }
  }

  return instances.sort((a, b) => a.applicabilityDate.getTime() - b.applicabilityDate.getTime());
}

/**
 * Generate projections from both recurrences and automations.
 */
export function generateAllProjectionsWithAutomations(
  recurrences: Recurrence[],
  automations: Automation[],
  streams: Stream[],
  fromDate: Date,
  toDate: Date
): ProjectedTransaction[] {
  const rec = generateAllProjections(recurrences, fromDate, toDate);
  const auto = generateAutomationInstances(automations, streams, fromDate, toDate);
  return [...rec, ...auto].sort((a, b) => a.applicabilityDate.getTime() - b.applicabilityDate.getTime());
}

/**
 * Combine real transactions with projected transactions
 */
export function combineRealAndProjected(
  realTransactions: Transaction[],
  projectedTransactions: ProjectedTransaction[]
): Array<Transaction | ProjectedTransaction> {
  return [...realTransactions, ...projectedTransactions].sort(
    (a, b) => a.applicabilityDate.getTime() - b.applicabilityDate.getTime()
  );
}

/**
 * Get upcoming instances for preview (next N occurrences)
 */
export function getUpcomingInstances(
  recurrence: Recurrence,
  count: number = 5
): Date[] {
  const instances: Date[] = [];
  let currentDate = new Date(recurrence.startDate);
  
  // If start date is in the past, start from today
  const today = new Date();
  if (isBefore(currentDate, today)) {
    currentDate = new Date(today);
  }

  for (let i = 0; i < count; i++) {
    // Check if we've passed the end date
    if (recurrence.endDate && isAfter(currentDate, recurrence.endDate)) {
      break;
    }

    instances.push(new Date(currentDate));
    currentDate = getNextOccurrence(currentDate, recurrence);
  }

  return instances;
}
