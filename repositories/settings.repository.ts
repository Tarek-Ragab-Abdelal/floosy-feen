// Settings Repository

import { getDB } from '@/lib/db/init';
import { STORES } from '@/lib/db/schema';
import { UserSettings } from '@/types/domain';

const SETTINGS_ID = '1'; // Single user, single settings record

export class SettingsRepository {
  async get(): Promise<UserSettings | null> {
    const db = await getDB();
    const data = await db.get(STORES.SETTINGS, SETTINGS_ID);
    
    if (!data) return null;

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async create(data: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt' | 'isFirstLaunch'>): Promise<UserSettings> {
    const db = await getDB();
    const settings: UserSettings = {
      ...data,
      id: SETTINGS_ID,
      isFirstLaunch: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsData = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    await db.put(STORES.SETTINGS, settingsData);
    return settings;
  }

  async update(updates: Partial<UserSettings>): Promise<UserSettings> {
    const db = await getDB();
    const existing = await this.get();
    
    if (!existing) {
      throw new Error('Settings not found. Please initialize settings first.');
    }

    const updated: UserSettings = {
      ...existing,
      ...updates,
      id: SETTINGS_ID,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    const settingsData = {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    await db.put(STORES.SETTINGS, settingsData);
    return updated;
  }

  async isFirstLaunch(): Promise<boolean> {
    const settings = await this.get();
    return settings === null || settings.isFirstLaunch;
  }

  async markLaunchComplete(): Promise<void> {
    const settings = await this.get();
    if (settings) {
      await this.update({ isFirstLaunch: false });
    }
  }
}
