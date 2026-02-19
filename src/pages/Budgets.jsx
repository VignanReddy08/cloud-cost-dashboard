import { useState, useEffect } from 'react';
import { Plus, Bell, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { BUDGETS_DATA } from '../utils/mockData';

export default function Budgets() {
    const [budgets, setBudgets] = useState(BUDGETS_DATA);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const savedCreds = localStorage.getItem('aws_credentials');
            if (!savedCreds) {
                // throw new Error('AWS credentials not found. Please configure them in Settings.');
                console.log('No credentials found, using mock data');
                setBudgets(BUDGETS_DATA);
                setAlerts([
                    { id: 1, type: 'info', message: 'Viewing Demo Budgets (Connect AWS to see real data)', date: 'Just now', severity: 'low' }
                ]);
                return;
            }
            const credentials = JSON.parse(savedCreds);

            if (!credentials.accountId) {
                // If accountId is missing, we can try to fetch it via API check or ask user to go to settings
                // For now, let's try to proceed, maybe the server can handle it (I added server-side STS fetch fallback)
                // But generally good to warn
                console.warn('Account ID missing in credentials, relying on server-side resolution');
            }

            const data = await api.getBudgets({ ...credentials, accountId: credentials.accountId });
            setBudgets(data);

            // Mock alerts just for UI since AWS Budgets API for alerts is complex
            setAlerts([
                { id: 1, type: 'info', message: 'Budgets synced from AWS', date: 'Just now', severity: 'low' }
            ]);

        } catch (err) {
            console.error(err);
            // setError(err.message);
            // Fallback to mock data on error too for better UX in demo
            console.warn('Failed to fetch budgets, using mock data');
            setBudgets(BUDGETS_DATA);
            setAlerts([
                { id: 1, type: 'warning', message: 'Could not fetch live budgets. Showing demo data.', date: 'Just now', severity: 'medium' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load budgets</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <button
                    onClick={fetchBudgets}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Budgets & Alerts</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage spending limits and configure real-time notifications.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Create Budget
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budgets List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-md font-bold text-gray-900">Active Budgets</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {budgets.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No budgets found in this AWS account.
                                </div>
                            ) : (
                                budgets.map((budget) => {
                                    const limit = parseFloat(budget.BudgetLimit?.Amount || 0);
                                    const current = parseFloat(budget.CalculatedSpend?.ActualSpend?.Amount || 0);
                                    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;

                                    let statusColor = 'bg-green-500';
                                    if (percentage >= 90) statusColor = 'bg-red-500';
                                    else if (percentage >= 75) statusColor = 'bg-yellow-500';

                                    return (
                                        <div key={budget.BudgetName} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{budget.BudgetName}</h4>
                                                    <span className="text-xs text-gray-500">Reset: {budget.TimeUnit}</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${percentage >= 90 ? 'bg-red-100 text-red-700' :
                                                    percentage >= 75 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {percentage}% Used
                                                </span>
                                            </div>

                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-2xl font-bold text-gray-900">${current.toLocaleString()}</span>
                                                <span className="text-sm text-gray-500 mb-1">/ ${limit.toLocaleString()}</span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${statusColor}`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-md font-bold text-gray-900">Recent Alerts</h3>
                            <button className="text-xs text-blue-600 hover:text-blue-700">Configure</button>
                        </div>
                        <div className="p-4 space-y-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex gap-3 items-start p-3 bg-red-50 rounded-lg border border-red-100">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                <Bell className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No other critical alerts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
