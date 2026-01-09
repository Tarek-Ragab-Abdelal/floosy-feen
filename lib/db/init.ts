// IndexedDB Initialization

import { openDB, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORES } from './schema';

let dbInstance: IDBPDatabase | null = null;
let initPromise: Promise<IDBPDatabase> | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    // console.log('initDB: returning existing instance');
    return dbInstance;
  }

  if (initPromise) {
    console.log('initDB: returning existing promise');
    return initPromise;
  }


  initPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

      // Create streams store
      if (!db.objectStoreNames.contains(STORES.STREAMS)) {
        const streamStore = db.createObjectStore(STORES.STREAMS, { keyPath: 'id' });
        // streamStore.createIndex('by-type', 'type'); // Deprecated
        streamStore.createIndex('by-archived', 'archivedAt');
      }

      // Create transactions store
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
        txStore.createIndex('by-stream', 'streamId');
        txStore.createIndex('by-applicability-date', 'applicabilityDate');
        txStore.createIndex('by-type', 'type');
        txStore.createIndex('by-recurrence', 'recurrenceId');
      }

      // Create recurrences store
      if (!db.objectStoreNames.contains(STORES.RECURRENCES)) {
        const recStore = db.createObjectStore(STORES.RECURRENCES, { keyPath: 'id' });
        recStore.createIndex('by-stream', 'streamId');
        recStore.createIndex('by-type', 'type');
      }

      // Create tags store
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        const tagStore = db.createObjectStore(STORES.TAGS, { keyPath: 'id' });
        tagStore.createIndex('by-name', 'name', { unique: true });
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }

      // Create exchange rates store
      if (!db.objectStoreNames.contains(STORES.EXCHANGE_RATES)) {
        const rateStore = db.createObjectStore(STORES.EXCHANGE_RATES, { keyPath: 'id' });
        rateStore.createIndex('by-currencies', ['fromCurrency', 'toCurrency']);
        rateStore.createIndex('by-date', 'date');
      }

      // Create automations store
      if (!db.objectStoreNames.contains(STORES.AUTOMATIONS)) {
        db.createObjectStore(STORES.AUTOMATIONS, { keyPath: 'id' });
      }
    },
    blocked() {
      console.warn('Database initialization blocked by older version');
    },
    blocking() {
      console.warn('Database connection blocking newer version');
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
    terminated() {
      console.error('Database connection unexpectedly terminated');
      dbInstance = null;
    },
  });

  try {
    dbInstance = await initPromise;
    return dbInstance;
  } catch (error) {
    dbInstance = null;
    initPromise = null;
    throw error;
  }
}

export async function getDB(): Promise<IDBPDatabase> {
  return await initDB();
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    initPromise = null;
  }
}

export async function resetDB(): Promise<void> {
  await closeDB();
  
  // Wait a bit to ensure connections are fully closed
  await new Promise(resolve => setTimeout(resolve, 100));

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    
    request.onsuccess = () => {
      console.log('Database deleted successfully');
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error deleting database', request.error);
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.warn('Database deletion blocked - please close other tabs');
      // Attempt to force reload if blocked? 
      // For now just warn
    };
  });
}
