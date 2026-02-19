import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subtext, trend, icon: Icon, color }) {
    const isPositive = trend > 0;

    return (
        <div className="glass-card p-6 rounded-xl flex items-start justify-between">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                {(subtext || trend) && (
                    <div className="flex items-center mt-2 gap-2">
                        {trend && (
                            <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {subtext && <span className="text-gray-400 text-sm">{subtext}</span>}
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color} shadow-lg shadow-blue-500/20`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );
}
