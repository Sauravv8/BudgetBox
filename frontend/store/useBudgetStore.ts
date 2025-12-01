import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Budget, SyncStatus, Category } from '@/types';
import { saveLocalBudget, loadLocalBudget } from '@/utils/localDB';

interface BudgetState {
    budget: Budget | null;
    syncStatus: SyncStatus;
    isLoading: boolean;

    // Actions
    setBudget: (budget: Budget) => void;
    updateCategory: (categoryId: string, amount: number) => void;
    addCategory: (name: string, amount: number) => void;
    removeCategory: (categoryId: string) => void;
    setIncome: (amount: number) => void;
    markSynced: (timestamp: string) => void;
    setSyncStatus: (status: SyncStatus) => void;
    loadInitialBudget: (userId: string, month: string) => Promise<void>;
    syncBudget: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set, get) => ({
            budget: null,
            syncStatus: 'local-only',
            isLoading: false,

            setBudget: (budget) => {
                set({ budget, syncStatus: 'sync-pending' });
                saveLocalBudget(budget);
            },

            updateCategory: (categoryId, amount) => {
                const { budget } = get();
                if (!budget) return;

                const newCategories = budget.categories.map(c =>
                    c.id === categoryId ? { ...c, amount } : c
                );

                const totalExpenses = newCategories.reduce((sum, c) => sum + c.amount, 0);

                const newBudget = {
                    ...budget,
                    categories: newCategories,
                    totalExpenses,
                    lastModified: new Date().toISOString(),
                    version: budget.version + 1
                };

                set({ budget: newBudget, syncStatus: 'sync-pending' });
                saveLocalBudget(newBudget);
            },

            addCategory: (name, amount) => {
                const { budget } = get();
                if (!budget) return;

                const newCategory: Category = { id: uuidv4(), name, amount };
                const newCategories = [...budget.categories, newCategory];
                const totalExpenses = newCategories.reduce((sum, c) => sum + c.amount, 0);

                const newBudget = {
                    ...budget,
                    categories: newCategories,
                    totalExpenses,
                    lastModified: new Date().toISOString(),
                    version: budget.version + 1
                };

                set({ budget: newBudget, syncStatus: 'sync-pending' });
                saveLocalBudget(newBudget);
            },

            removeCategory: (categoryId) => {
                const { budget } = get();
                if (!budget) return;

                const newCategories = budget.categories.filter(c => c.id !== categoryId);
                const totalExpenses = newCategories.reduce((sum, c) => sum + c.amount, 0);

                const newBudget = {
                    ...budget,
                    categories: newCategories,
                    totalExpenses,
                    lastModified: new Date().toISOString(),
                    version: budget.version + 1
                };

                set({ budget: newBudget, syncStatus: 'sync-pending' });
                saveLocalBudget(newBudget);
            },

            setIncome: (amount) => {
                const { budget } = get();
                if (!budget) return;

                const newBudget = {
                    ...budget,
                    income: amount,
                    lastModified: new Date().toISOString(),
                    version: budget.version + 1
                };

                set({ budget: newBudget, syncStatus: 'sync-pending' });
                saveLocalBudget(newBudget);
            },

            markSynced: (timestamp) => {
                const { budget } = get();
                if (!budget) return;

                const newBudget = { ...budget, lastModified: timestamp };
                set({ budget: newBudget, syncStatus: 'synced' });
                saveLocalBudget(newBudget);
            },

            setSyncStatus: (status) => set({ syncStatus: status }),

            loadInitialBudget: async (userId, month) => {
                set({ isLoading: true });
                try {
                    const localBudget = await loadLocalBudget(userId, month);
                    if (localBudget) {
                        set({ budget: localBudget });
                    } else {
                        const newBudget: Budget = {
                            userId,
                            month,
                            income: 0,
                            categories: [],
                            totalExpenses: 0,
                            lastModified: new Date().toISOString(),
                            version: 0
                        };
                        set({ budget: newBudget, syncStatus: 'local-only' });
                        await saveLocalBudget(newBudget);
                    }
                } catch (error) {
                    console.error('Failed to load budget:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            syncBudget: async () => {
                const { budget } = get();
                if (!budget) return;

                try {
                    const response = await fetch('http://localhost:3001/budget/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(budget),
                    });

                    const data = await response.json();

                    if (data.success) {
                        if (data.status === 'synced') {
                            const newBudget = { ...budget, lastModified: data.timestamp };
                            set({ budget: newBudget, syncStatus: 'synced' });
                            await saveLocalBudget(newBudget);
                        }
                    } else if (data.reason === 'server-newer') {
                        const serverBudget = data.serverCopy;
                        set({ budget: serverBudget, syncStatus: 'synced' });
                        await saveLocalBudget(serverBudget);
                        alert('Budget updated from server (newer version found).');
                    }
                } catch (error) {
                    console.error('Sync failed:', error);
                }
            }
        }),
        {
            name: 'budgetbox-store',
            partialize: (state) => ({ syncStatus: state.syncStatus }),
        }
    )
);
