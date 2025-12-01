"use client";

import { useState, useEffect } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { Plus, Trash2 } from "lucide-react";

export default function BudgetForm() {
    const {
        budget,
        loadInitialBudget,
        setIncome,
        addCategory,
        updateCategory,
        removeCategory,
        isLoading
    } = useBudgetStore();

    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [userId] = useState("demo-user"); // Hardcoded for now as per requirements
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        loadInitialBudget(userId, month);
    }, [userId, month, loadInitialBudget]);

    const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIncome(Number(e.target.value));
    };

    const handleCategoryAmountChange = (id: string, amount: string) => {
        updateCategory(id, Number(amount));
    };

    const handleAddCategoryClick = () => {
        setIsAddingCategory(true);
        setNewCategoryName("");
    };

    const handleSaveNewCategory = () => {
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim(), 0);
            setIsAddingCategory(false);
            setNewCategoryName("");
        }
    };

    const handleCancelAddCategory = () => {
        setIsAddingCategory(false);
        setNewCategoryName("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveNewCategory();
        } else if (e.key === 'Escape') {
            handleCancelAddCategory();
        }
    };

    if (isLoading) return <div className="p-4">Loading budget...</div>;

    return (
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                    <label htmlFor="month" className="block text-sm font-medium text-black mb-1">
                        Select Month
                    </label>
                    <input
                        type="month"
                        id="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full rounded-lg text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                </div>
            </div>

            {budget && (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Income
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-black">$</span>
                            <input
                                type="number"
                                value={budget.income}
                                onChange={handleIncomeChange}
                                className="w-full pl-8 rounded-lg text-black border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                            <button
                                onClick={handleAddCategoryClick}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Plus size={16} /> Add Category
                            </button>
                        </div>

                        <div className="space-y-3">
                            {isAddingCategory && (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        type="text"
                                        placeholder="Category name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        className="flex-1 rounded-md border-gray-300 border p-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 text-black"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSaveNewCategory}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={handleCancelAddCategory}
                                            className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-xs font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {budget.categories.map((category) => (
                                <div key={category.id} className="flex items-center gap-3 group">
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-700">{category.name}</span>
                                    </div>
                                    <div className="w-32 relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={category.amount}
                                            onChange={(e) => handleCategoryAmountChange(category.id, e.target.value)}
                                            className="w-full pl-7 py-1.5 text-sm rounded-md border-gray-300 border focus:ring-blue-500 focus:border-blue-500 text-black"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeCategory(category.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}

                            {budget.categories.length === 0 && !isAddingCategory && (
                                <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed">
                                    No expenses added yet
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total Expenses</span>
                            <span className="font-bold text-lg text-gray-900">
                                ${budget.totalExpenses.toLocaleString()}
                            </span>
                        </div>

                        <div className="mt-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Remaining</span>
                            <span className={`font-bold text-lg ${budget.income - budget.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${(budget.income - budget.totalExpenses).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
