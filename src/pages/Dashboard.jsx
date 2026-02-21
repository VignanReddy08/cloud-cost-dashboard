import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PiggyBank, RefreshCw } from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import CostTrendChart from '../components/dashboard/CostTrendChart';
import TopSpenders from '../components/dashboard/TopSpenders';
import { DASHBOARD_DATA } from '../utils/mockData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(DASHBOARD_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usingRealData, setUsingRealData] = useState(false);

    const fetchData = async () => {
        const savedCreds = localStorage.getItem('aws_credentials');
        if (!savedCreds) {
            setUsingRealData(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const credentials = JSON.parse(savedCreds);
            const realData = await api.getCostData(credentials);

            // Format dates for the chart (YYYY-MM-DD -> MMM D)
            const formattedTrend = realData.costTrend.map(item => {
                const date = new Date(item.date);
                return {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    cost: item.cost
                };
            });

            setData({
                metrics: realData.metrics,
                costTrend: formattedTrend,
                topSpenders: realData.topSpenders
            });
            setUsingRealData(true);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch live data. Showing demo data.');
            setUsingRealData(false);
            // Fallback to mock data is implicit since we initialized with it, 
            // but if we want to be explicit or if we cleared it:
            setData(DASHBOARD_DATA);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { metrics, costTrend, topSpenders } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}! 👋
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {usingRealData ? 'Viewing real data from AWS.' : 'Viewing demo data. Connect AWS in Settings.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {error && <span className="text-red-500 text-sm">{error}</span>}
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="btn-secondary py-1.5"
                    >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Updating...' : 'Refresh'}
                    </button>
                    <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                        {usingRealData ? 'Live Data' : 'Demo Mode'}
                    </div>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Cost (Last 14 Days)"
                    value={`${metrics.currency}${metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    trend={12.5}
                    icon={DollarSign}
                    color="bg-blue-600"
                />
                <MetricCard
                    title="Forecasted Cost"
                    value={`${metrics.currency}${metrics.projectedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext="Next 14 days"
                    icon={TrendingUp}
                    color="bg-purple-600"
                />
                <MetricCard
                    title="Savings Potential"
                    value={`${metrics.currency}${metrics.savingsPotential.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext="Optimization opportunities"
                    icon={PiggyBank}
                    color="bg-green-600"
                />
            </div>

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CostTrendChart data={costTrend} />
                </div>
                <div className="lg:col-span-1 h-96">
                    <TopSpenders data={topSpenders} />
                </div>
            </div>
        </div>
    );
}
