import localforage from 'localforage';
import { Budget } from '@/types';

// Initialize localforage
localforage.config({
    name: 'budgetbox',
    storeName: 'budgets',
    description: 'BudgetBox local storage'
});

export const saveLocalBudget = async (budget: Budget): Promise<Budget> => {
    const key = `budget:${budget.userId}:${budget.month}`;
    return await localforage.setItem(key, budget);
};

export const loadLocalBudget = async (userId: string, month: string): Promise<Budget | null> => {
    const key = `budget:${userId}:${month}`;
    return await localforage.getItem<Budget>(key);
};

export const getAllBudgets = async (): Promise<Budget[]> => {
    const budgets: Budget[] = [];
    await localforage.iterate((value: Budget, key) => {
        if (key.startsWith('budget:')) {
            budgets.push(value);
        }
    });
    return budgets;
};
