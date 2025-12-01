"use client";

import { useBudgetStore } from "@/store/useBudgetStore";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

export default function Dashboard() {
    const { budget } = useBudgetStore();

    if (!budget) return null;

    const remaining = Math.max(0, budget.income - budget.totalExpenses);

    const doughnutData = {
        labels: ['Expenses', 'Remaining'],
        datasets: [
            {
                data: [budget.totalExpenses, remaining],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.9)', // Vibrant Red
                    'rgba(34, 197, 94, 0.9)', // Vibrant Green
                ],
                borderColor: [
                    'rgba(255, 255, 255, 0.8)',
                    'rgba(255, 255, 255, 0.8)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const barData = {
        labels: budget.categories.map(c => c.name),
        datasets: [
            {
                label: 'Expenses by Category',
                data: budget.categories.map(c => c.amount),
                backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo-500
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Overview</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Breakdown</h3>
                <div className="h-64">
                    <Bar
                        data={barData}
                        options={{
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(0, 0, 0, 0.05)'
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
