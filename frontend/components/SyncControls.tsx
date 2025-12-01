"use client";

import { useBudgetStore } from "@/store/useBudgetStore";
import { RefreshCw, CheckCircle, AlertCircle, Cloud } from "lucide-react";

export default function SyncControls() {
    const { syncStatus, syncBudget, budget } = useBudgetStore();

    const getStatusColor = () => {
        switch (syncStatus) {
            case 'synced': return 'text-green-600 bg-green-50 border-green-200';
            case 'sync-pending': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'local-only': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = () => {
        switch (syncStatus) {
            case 'synced': return <CheckCircle size={18} />;
            case 'sync-pending': return <AlertCircle size={18} />;
            case 'local-only': return <Cloud size={18} />;
        }
    };

    const getStatusText = () => {
        switch (syncStatus) {
            case 'synced': return 'All changes saved to cloud';
            case 'sync-pending': return 'Unsaved changes';
            case 'local-only': return 'Local only';
        }
    };

    if (!budget) return null;

    return (
        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
            </div>

            <button
                onClick={() => syncBudget()}
                disabled={syncStatus === 'synced'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                    ${syncStatus === 'synced'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}`}
            >
                <RefreshCw size={18} className={syncStatus === 'sync-pending' ? 'animate-spin-slow' : ''} />
                Sync Now
            </button>
        </div>
    );
}
