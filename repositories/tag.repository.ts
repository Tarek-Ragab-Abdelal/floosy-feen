// Tag Repository

import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { Tag } from '@/types/domain';
import { BaseRepository } from './base.repository';

export class TagRepository implements BaseRepository<Tag> {
  async create(data: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    const db = await getDB();
    const tag: Tag = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };

    const tagData = {
      ...tag,
      createdAt: tag.createdAt.toISOString(),
    };

    await db.put(STORES.TAGS, tagData);
    return tag;
  }

  async findById(id: string): Promise<Tag | null> {
    const db = await getDB();
    const data = await db.get(STORES.TAGS, id);
    
    if (!data) return null;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  }

  async findAll(): Promise<Tag[]> {
    const db = await getDB();
    const allTags = await db.getAll(STORES.TAGS);

    return allTags.map(data => ({
      ...data,
      createdAt: new Date(data.createdAt),
    }));
  }

  async findByName(name: string): Promise<Tag | null> {
    const db = await getDB();
    try {
      // Check if store exists in this transaction context - though initDB guarantees it, 
      // safer to wrap in try-catch for index access
      const tx = db.transaction(STORES.TAGS);
      const index = tx.store.index('by-name');
      const data = await index.get(name);
      
      if (!data) return null;

      return {
        ...data,
        createdAt: new Date(data.createdAt),
      };
    } catch (error) {
      // If store/index doesn't exist or transaction fails
      console.warn('Error querying tag by name:', error);
      return null;
    }
  }

  async findOrCreate(name: string): Promise<Tag> {
    const existing = await this.findByName(name);
    if (existing) return existing;

    return this.create({ name });
  }

  async update(id: string, updates: Partial<Tag>): Promise<Tag> {
    const db = await getDB();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Tag with id ${id} not found`);
    }

    const updated: Tag = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    const tagData = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    };

    await db.put(STORES.TAGS, tagData);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.TAGS, id);
  }
}
