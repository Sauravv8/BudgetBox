export type CategoryName = 'Bills' | 'Food' | 'Transport' | 'Subscriptions' | 'Misc' | string;

export interface Category {
    id: string;
    name: CategoryName;
    amount: number;
}

export interface Budget {
    userId: string;
    month: string; // YYYY-MM
    income: number;
    categories: Category[];
    totalExpenses: number;
    lastModified: string; // ISO timestamp
    version: number;
}

export type SyncStatus = 'local-only' | 'sync-pending' | 'synced';
