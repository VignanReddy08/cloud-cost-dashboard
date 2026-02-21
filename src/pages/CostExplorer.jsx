import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Download, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { DASHBOARD_DATA } from '../utils/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CostExplorer() {
    const [timeRange, setTimeRange] = useState('14d');
    const [dailyCost, setDailyCost] = useState(DASHBOARD_DATA.costTrend);
    // Initialize with mock distribution derived from mock top spenders
    const initialDistribution = DASHBOARD_DATA.topSpenders.map(item => ({
        name: item.service,
        value: item.cost
    }));
    const [serviceDistribution, setServiceDistribution] = useState(initialDistribution);
    const [topSpenders, setTopSpenders] = useState(DASHBOARD_DATA.topSpenders);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const savedCreds = localStorage.getItem('aws_credentials');
            if (!savedCreds) {
                console.log('No credentials found, using mock data');
                return;
            }
            const credentials = JSON.parse(savedCreds);

            const days = parseInt(timeRange) || 14;

            const data = await api.getCostData({ ...credentials, days });

            setDailyCost(data.costTrend);

            const distribution = data.topSpenders.map(item => ({
                name: item.service,
                value: item.cost
            }));
            setServiceDistribution(distribution);
            setTopSpenders(data.topSpenders);

        } catch (err) {
            console.error(err);
            console.warn('Failed to fetch cost data, using mock data');
            setDailyCost(DASHBOARD_DATA.costTrend);
            const distribution = DASHBOARD_DATA.topSpenders.map(item => ({
                name: item.service,
                value: item.cost
            }));
            setServiceDistribution(distribution);
            setTopSpenders(DASHBOARD_DATA.topSpenders);
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unable to load cost data</h3>
                <p className="text-red-700 dark:text-red-400 mb-6">{error}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.href = '/settings'}
                        className="btn-secondary"
                    >
                        Check Settings
                    </button>
                    <button
                        onClick={fetchData}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Explorer</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyze your spending patterns across services and regions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="btn-secondary">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center transition-colors duration-300">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="14d">Last 14 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>

                <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <option value="all">All Services</option>
                    <option value="ec2">EC2</option>
                    <option value="s3">S3</option>
                    <option value="rds">RDS</option>
                </select>

                <select className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                    <option value="all">All Regions</option>
                    <option value="us-east-1">us-east-1</option>
                    <option value="eu-west-1">eu-west-1</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Daily Cost Trend</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={dailyCost}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-20" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} tick={{ fill: '#9ca3af' }} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{ fill: '#9ca3af' }} />
                            <Tooltip
                                cursor={{ fill: 'var(--tw-colors-gray-100, #f3f4f6)', opacity: 0.1 }}
                                contentStyle={{ backgroundColor: 'var(--tw-colors-gray-900, #111827)', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
                            />
                            <Bar dataKey="cost" fill="#2563eb" name="Total Cost" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-96 transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Cost by Service (Top 5)</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={serviceDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {serviceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--tw-colors-gray-900, #111827)', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Spenders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3 text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSpenders.map((item, index) => (
                                <tr key={index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.service}</td>
                                    <td className="px-6 py-4 text-right">${item.cost.toFixed(2)}</td>
                                </tr>
                            ))}
                            {topSpenders.length === 0 && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-400">
                                        No data available for this period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
