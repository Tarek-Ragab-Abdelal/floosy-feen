// Stream Repository

import { v4 as uuidv4 } from 'uuid';
import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { Stream } from '@/types/domain';
import { BaseRepository } from './base.repository';

export class StreamRepository implements Omit<BaseRepository<Stream>, 'delete'> {
  async create(data: Omit<Stream, 'id' | 'createdAt' | 'archivedAt'>): Promise<Stream> {
    console.log('StreamRepository.create start');
    const db = await getDB();
    console.log('StreamRepository.create - Got DB');
    const stream: Stream = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      archivedAt: null,
    };

    const streamData = {
      ...stream,
      createdAt: stream.createdAt.toISOString(),
      archivedAt: stream.archivedAt,
    };

    console.log('StreamRepository.create - putting to DB', streamData);
    await db.put(STORES.STREAMS, streamData);
    console.log('StreamRepository.create - put success');
    return stream;
  }

  async findById(id: string): Promise<Stream | null> {
    const db = await getDB();
    const data = await db.get(STORES.STREAMS, id);
    
    if (!data) return null;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
    };
  }

  async findAll(): Promise<Stream[]> {
    const db = await getDB();
    console.log('StreamRepository.findAll - querying DB');
    const allStreams = await db.getAll(STORES.STREAMS);
    console.log(`StreamRepository.findAll - DB returned ${allStreams.length} records`);

    return allStreams.map(data => ({
      ...data,
      createdAt: new Date(data.createdAt),
      archivedAt: data.archivedAt ? new Date(data.archivedAt) : null,
    }));
  }

  async findActive(): Promise<Stream[]> {
    console.log('StreamRepository.findActive start');
    const allStreams = await this.findAll();
    console.log(`StreamRepository.findActive - findAll returned ${allStreams.length} streams`);
    
    const activeStreams = allStreams.filter(s => s.archivedAt === null);
    console.log(`StreamRepository.findActive - filtered to ${activeStreams.length} active streams`);

    return activeStreams;
  }

  // findByType is removed as 'type' property is deprecated

  async update(id: string, updates: Partial<Stream>): Promise<Stream> {
    const db = await getDB();
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Stream with id ${id} not found`);
    }

    // Prevent currency changes
    if (updates.baseCurrency && updates.baseCurrency !== existing.baseCurrency) {
      throw new Error('Cannot change base currency of an existing stream');
    }

    const updated: Stream = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      baseCurrency: existing.baseCurrency,
    };

    const streamData = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      archivedAt: updated.archivedAt ? updated.archivedAt.toISOString() : null,
    };

    await db.put(STORES.STREAMS, streamData);
    return updated;
  }

  async archive(id: string): Promise<Stream> {
    return this.update(id, { archivedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.STREAMS, id);
  }
}
