import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Download, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function CostExplorer() {
    const [timeRange, setTimeRange] = useState('14d');
    const [dailyCost, setDailyCost] = useState([]);
    const [serviceDistribution, setServiceDistribution] = useState([]);
    const [topSpenders, setTopSpenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const savedCreds = localStorage.getItem('aws_credentials');
            if (!savedCreds) {
                throw new Error('AWS credentials not found. Please configure them in Settings.');
            }
            const credentials = JSON.parse(savedCreds);

            // Extract days from timeRange (e.g., '7d' -> 7)
            const days = parseInt(timeRange) || 14;

            const data = await api.getCostData({ ...credentials, days });

            setDailyCost(data.costTrend);

            // Calculate service distribution from top spenders for the pie chart
            const distribution = data.topSpenders.map(item => ({
                name: item.service,
                value: item.cost
            }));
            setServiceDistribution(distribution);
            setTopSpenders(data.topSpenders);

        } catch (err) {
            console.error(err);
            setError(err.message);
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load cost data</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.href = '/settings'}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        Check Settings
                    </button>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
                    <h1 className="text-2xl font-bold text-gray-900">Cost Explorer</h1>
                    <p className="text-sm text-gray-500 mt-1">Analyze your spending patterns across services and regions.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="14d">Last 14 Days</option>
                    <option value="30d">Last 30 Days</option>
                </select>

                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Services</option>
                    <option value="ec2">EC2</option>
                    <option value="s3">S3</option>
                    <option value="rds">RDS</option>
                </select>

                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Regions</option>
                    <option value="us-east-1">us-east-1</option>
                    <option value="eu-west-1">eu-west-1</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Cost Trend</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={dailyCost}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
                            />
                            <Bar dataKey="cost" fill="#2563eb" name="Total Cost" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Cost by Service (Top 5)</h3>
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
                            >
                                {serviceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Top Spenders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3 text-right">Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSpenders.map((item, index) => (
                                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.service}</td>
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
