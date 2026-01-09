// Transaction Repository

import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { Transaction } from '@/types/domain';
import { BaseRepository } from './base.repository';

export class TransactionRepository implements BaseRepository<Transaction> {
  async create(data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const db = await getDB();
    const transaction: Transaction = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };

    const txData = {
      ...transaction,
      applicabilityDate: transaction.applicabilityDate.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    };

    await db.put(STORES.TRANSACTIONS, txData);
    // If the stream is a credit card (has creditLimit), update its currentUsage
    try {
      const streamRaw = await db.get(STORES.STREAMS, transaction.streamId);
      if (streamRaw && typeof streamRaw.creditLimit !== 'undefined') {
        const prevUsage = typeof streamRaw.currentUsage === 'number' ? streamRaw.currentUsage : 0;
        const delta = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
        let newUsage = prevUsage + delta;
        if (newUsage < 0) newUsage = 0;
        if (typeof streamRaw.creditLimit === 'number' && newUsage > streamRaw.creditLimit) {
          // Cap at credit limit
          newUsage = streamRaw.creditLimit;
        }

        const updatedStream = {
          ...streamRaw,
          currentUsage: newUsage,
        };

        await db.put(STORES.STREAMS, updatedStream);
      }
    } catch (err) {
      // Non-fatal: log and continue
      console.error('Failed to update stream usage after transaction create', err);
    }
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const db = await getDB();
    const data = await db.get(STORES.TRANSACTIONS, id);
    
    if (!data) return null;

    return {
      ...data,
      applicabilityDate: new Date(data.applicabilityDate),
      createdAt: new Date(data.createdAt),
    };
  }

  async findAll(): Promise<Transaction[]> {
    const db = await getDB();
    const allTransactions = await db.getAll(STORES.TRANSACTIONS);

    return allTransactions.map(data => ({
      ...data,
      applicabilityDate: new Date(data.applicabilityDate),
      createdAt: new Date(data.createdAt),
    }));
  }

  async findByStream(streamId: string): Promise<Transaction[]> {
    const db = await getDB();
    const index = db.transaction(STORES.TRANSACTIONS).store.index('by-stream');
    const transactions = await index.getAll(streamId);

    return transactions.map(data => ({
      ...data,
      applicabilityDate: new Date(data.applicabilityDate),
      createdAt: new Date(data.createdAt),
    }));
  }

  async findByDateRange(fromDate: Date, toDate: Date): Promise<Transaction[]> {
    const db = await getDB();
    const allTransactions = await this.findAll();

    return allTransactions.filter(tx => 
      tx.applicabilityDate >= fromDate && tx.applicabilityDate <= toDate
    );
  }

  async findMoneyInHand(asOfDate: Date): Promise<Transaction[]> {
    const allTransactions = await this.findAll();
    return allTransactions.filter(tx => tx.applicabilityDate <= asOfDate);
  }

  async findProjected(asOfDate: Date): Promise<Transaction[]> {
    const allTransactions = await this.findAll();
    return allTransactions.filter(tx => tx.applicabilityDate > asOfDate);
  }

  async findByRecurrence(recurrenceId: string): Promise<Transaction[]> {
    const db = await getDB();
    const index = db.transaction(STORES.TRANSACTIONS).store.index('by-recurrence');
    const transactions = await index.getAll(recurrenceId);

    return transactions.map(data => ({
      ...data,
      applicabilityDate: new Date(data.applicabilityDate),
      createdAt: new Date(data.createdAt),
    }));
  }

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const db = await getDB();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    const updated: Transaction = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const txData = {
      ...updated,
      applicabilityDate: updated.applicabilityDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };

    await db.put(STORES.TRANSACTIONS, txData);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.TRANSACTIONS, id);
  }

  async deleteByRecurrence(recurrenceId: string): Promise<void> {
    const transactions = await this.findByRecurrence(recurrenceId);
    const db = await getDB();
    
    for (const tx of transactions) {
      await db.delete(STORES.TRANSACTIONS, tx.id);
    }
  }
}
