import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { Automation } from '@/types/domain';
import { BaseRepository } from './base.repository';

export class AutomationRepository implements Omit<BaseRepository<Automation>, 'delete'> {
  async create(data: Omit<Automation, 'id' | 'createdAt'>): Promise<Automation> {
    const db = await getDB();
    const automation: Automation = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };

    const automationData = {
      ...automation,
      createdAt: automation.createdAt.toISOString(),
      lastRunAt: automation.lastRunAt ? automation.lastRunAt.toISOString() : undefined,
    };

    await db.put(STORES.AUTOMATIONS, automationData); // Need to add to STORES/Schema
    return automation;
  }

  async findById(id: string): Promise<Automation | null> {
    const db = await getDB();
    const data = await db.get(STORES.AUTOMATIONS, id);
    
    if (!data) return null;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      lastRunAt: data.lastRunAt ? new Date(data.lastRunAt) : undefined,
    };
  }

  async findAll(): Promise<Automation[]> {
    const db = await getDB();
    const all = await db.getAll(STORES.AUTOMATIONS);

    return all.map(data => ({
      ...data,
      createdAt: new Date(data.createdAt),
      lastRunAt: data.lastRunAt ? new Date(data.lastRunAt) : undefined,
    }));
  }

  async update(id: string, updates: Partial<Automation>): Promise<Automation> {
    const db = await getDB();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Automation with id ${id} not found`);
    }

    const updated: Automation = {
      ...existing,
      ...updates,
    };

    const updatedData = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      lastRunAt: updated.lastRunAt ? updated.lastRunAt.toISOString() : undefined,
    };

    await db.put(STORES.AUTOMATIONS, updatedData);
    return updated;
  }
}

export const automationRepo = new AutomationRepository();
