// Recurrence Repository

import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { Recurrence } from '@/types/domain';
import { BaseRepository } from './base.repository';

export class RecurrenceRepository implements BaseRepository<Recurrence> {
  async create(data: Omit<Recurrence, 'id'>): Promise<Recurrence> {
    const db = await getDB();
    const recurrence: Recurrence = {
      ...data,
      id: uuidv4(),
    };

    const recData = {
      ...recurrence,
      startDate: recurrence.startDate.toISOString(),
      endDate: recurrence.endDate ? recurrence.endDate.toISOString() : null,
    };

    await db.put(STORES.RECURRENCES, recData);
    return recurrence;
  }

  async findById(id: string): Promise<Recurrence | null> {
    const db = await getDB();
    const data = await db.get(STORES.RECURRENCES, id);
    
    if (!data) return null;

    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    };
  }

  async findAll(): Promise<Recurrence[]> {
    const db = await getDB();
    const allRecurrences = await db.getAll(STORES.RECURRENCES);

    return allRecurrences.map(data => ({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    }));
  }

  async findByStream(streamId: string): Promise<Recurrence[]> {
    const db = await getDB();
    const index = db.transaction(STORES.RECURRENCES).store.index('by-stream');
    const recurrences = await index.getAll(streamId);

    return recurrences.map(data => ({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    }));
  }

  async update(id: string, updates: Partial<Recurrence>): Promise<Recurrence> {
    const db = await getDB();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Recurrence with id ${id} not found`);
    }

    const updated: Recurrence = {
      ...existing,
      ...updates,
      id: existing.id,
    };

    const recData = {
      ...updated,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate ? updated.endDate.toISOString() : null,
    };

    await db.put(STORES.RECURRENCES, recData);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.RECURRENCES, id);
  }
}
