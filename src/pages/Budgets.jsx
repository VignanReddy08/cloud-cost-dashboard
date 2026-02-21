import { useState, useEffect } from 'react';
import { Plus, Bell, AlertTriangle, Loader2, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';
import { BUDGETS_DATA } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';

export default function Budgets() {
    const [budgets, setBudgets] = useState(BUDGETS_DATA);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();

    // Create Budget Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState('');
    const [newBudgetTimeUnit, setNewBudgetTimeUnit] = useState('MONTHLY');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

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
            setError('Could not fetch live budgets from AWS. Showing demo data.');
            console.warn('Failed to fetch budgets, using mock data');
            setBudgets(BUDGETS_DATA);
            setAlerts([
                { id: 1, type: 'warning', message: 'Could not fetch live budgets. Showing demo data.', date: 'Just now', severity: 'medium' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async (e) => {
        e.preventDefault();
        setCreateError(null);
        setIsCreating(true);

        try {
            const savedCreds = localStorage.getItem('aws_credentials');
            if (!savedCreds) {
                throw new Error('AWS credentials not found. Please configure them in Settings.');
            }
            const credentials = JSON.parse(savedCreds);

            const emailAlertsEnabled = localStorage.getItem('emailAlertsEnabled') === 'true';
            const alertEmail = emailAlertsEnabled && user ? user.email : null;

            await api.createBudget(credentials, {
                budgetName: newBudgetName,
                limitAmount: parseFloat(newBudgetLimit),
                timeUnit: newBudgetTimeUnit,
                alertEmail
            });

            // Refresh budgets
            await fetchBudgets();

            // Close and reset modal
            setIsCreateModalOpen(false);
            setNewBudgetName('');
            setNewBudgetLimit('');
            setNewBudgetTimeUnit('MONTHLY');

            // Add success alert
            setAlerts(prev => [
                { id: Date.now(), type: 'success', message: `Budget "${newBudgetName}" created successfully.`, date: 'Just now', severity: 'low' },
                ...prev
            ]);

        } catch (err) {
            setCreateError(err.message || 'Failed to create budget');
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets & Alerts</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage spending limits and configure real-time notifications.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Create Budget
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Connection Error</h3>
                            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Budgets List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-md font-bold text-gray-900 dark:text-white">Active Budgets</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {budgets.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
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
                                        <div key={budget.BudgetName} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">{budget.BudgetName}</h4>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Reset: {budget.TimeUnit}</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${percentage >= 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    percentage >= 75 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}>
                                                    {percentage}% Used
                                                </span>
                                            </div>

                                            <div className="flex items-end gap-2 mb-2">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">${current.toLocaleString()}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ ${limit.toLocaleString()}</span>
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
                    <div className="glass-card rounded-xl border border-gray-100 dark:border-gray-700 h-full transition-colors duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-md font-bold text-gray-900 dark:text-white">Recent Alerts</h3>
                            <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Configure</button>
                        </div>
                        <div className="p-4 space-y-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex gap-3 items-start p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.date}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
                                <Bell className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No other critical alerts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Budget Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Budget</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBudget} className="p-6 space-y-4">
                            {createError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/50">
                                    {createError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Budget Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBudgetName}
                                    onChange={(e) => setNewBudgetName(e.target.value)}
                                    placeholder="e.g. Monthly Dev Database"
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Limit Amount (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="1"
                                        value={newBudgetLimit}
                                        onChange={(e) => setNewBudgetLimit(e.target.value)}
                                        placeholder="500"
                                        className="w-full p-2.5 pl-7 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time Unit</label>
                                <select
                                    value={newBudgetTimeUnit}
                                    onChange={(e) => setNewBudgetTimeUnit(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="DAILY">Daily</option>
                                    <option value="MONTHLY">Monthly</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="ANNUALLY">Annually</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isCreating ? 'Creating...' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
