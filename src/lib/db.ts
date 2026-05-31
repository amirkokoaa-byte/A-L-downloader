import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  dueTime?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  blob?: Blob;
  size: number;
  type: 'video' | 'audio';
  tags: string[];
  createdAt: number;
  encrypted: boolean;
}

export interface Settings {
  id: 'user_settings';
  darkMode: boolean;
  lockEnabled: boolean;
  passcode: string | null;
  notificationsEnabled: boolean;
}

interface AppDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-date': number };
  };
  media: {
    key: string;
    value: MediaItem;
    indexes: { 'by-date': number };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

const DB_NAME = 'media_tasks_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-date', 'createdAt');
        }
        if (!db.objectStoreNames.contains('media')) {
          const mediaStore = db.createObjectStore('media', { keyPath: 'id' });
          mediaStore.createIndex('by-date', 'createdAt');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Tasks API
export async function getTasks() {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-date');
}
export async function saveTask(task: Task) {
  const db = await getDB();
  return db.put('tasks', task);
}
export async function deleteTask(id: string) {
  const db = await getDB();
  return db.delete('tasks', id);
}

// Media API
export async function getMedia() {
  const db = await getDB();
  return db.getAllFromIndex('media', 'by-date');
}
export async function saveMedia(item: MediaItem) {
  const db = await getDB();
  return db.put('media', item);
}
export async function deleteMedia(id: string) {
  const db = await getDB();
  return db.delete('media', id);
}
export async function clearAllMedia() {
  const db = await getDB();
  await db.clear('media');
}

// Settings API
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user_settings');
  return settings || {
    id: 'user_settings',
    darkMode: true,
    lockEnabled: false,
    passcode: null,
    notificationsEnabled: true
  };
}
export async function saveSettings(settings: Settings) {
  const db = await getDB();
  return db.put('settings', settings);
}
