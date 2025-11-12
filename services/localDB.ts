import Dexie, { Table } from 'dexie';
import { Item, QuickAccessLink } from '../types';

// Define a more specific type for items stored in Dexie, where 'id' is optional before insertion.
type DexieItem = Omit<Item, 'id'> & { id?: number };
type DexieQuickAccessLink = Omit<QuickAccessLink, 'id'> & { id?: number };


class ProductivityDB extends Dexie {
  tasks!: Table<Item, number>;
  weeklyGoals!: Table<Item, number>;
  monthlyGoals!: Table<Item, number>;
  quickAccess!: Table<QuickAccessLink, number>;

  constructor() {
    super('productivityDashboard');
    // Fix for: Property 'version' does not exist on type 'ProductivityDB'.
    // Cast 'this' to Dexie to help TypeScript resolve the inherited method.
    (this as Dexie).version(1).stores({
      tasks: '++id, text, completed, createdAt',
      weeklyGoals: '++id, text, completed, createdAt',
      monthlyGoals: '++id, text, completed, createdAt',
      quickAccess: '++id, name, url, createdAt',
    });
  }
}

const db = new ProductivityDB();

const getTable = (collectionName: string): Table => {
    switch (collectionName) {
        case 'tasks': return db.tasks;
        case 'weeklyGoals': return db.weeklyGoals;
        case 'monthlyGoals': return db.monthlyGoals;
        case 'quickAccess': return db.quickAccess;
        default: throw new Error(`Unknown collection: ${collectionName}`);
    }
}

export const getCollection = async <T>(collectionName: string): Promise<T[]> => {
    const table = getTable(collectionName);
    // Sort by creation date, newest first
    return table.orderBy('createdAt').reverse().toArray() as Promise<T[]>;
};

export const addDocument = async (collectionName: string, data: Omit<Item, 'id'> | Omit<QuickAccessLink, 'id'>) => {
    const table = getTable(collectionName);
    return table.add({ ...data, createdAt: Date.now() });
};

export const updateDocument = async (collectionName: string, docId: number, data: object) => {
    const table = getTable(collectionName);
    return table.update(docId, data);
};

export const deleteDocument = async (collectionName: string, docId: number) => {
    const table = getTable(collectionName);
    return table.delete(docId);
};
