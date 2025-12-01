import BudgetForm from "@/components/BudgetForm";
import SyncControls from "@/components/SyncControls";
import Dashboard from "@/components/Dashboard";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">BudgetBox</h1>
                        <p className="text-gray-500 mt-1">Your personal finance companion</p>
                    </div>
                    <SyncControls />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <BudgetForm />
                    </div>
                    <div className="lg:col-span-2">
                        <Dashboard />
                    </div>
                </div>
            </div>
        </main>
    );
}
