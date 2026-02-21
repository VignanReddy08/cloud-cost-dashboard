import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, subtext, trend }) {
    const isPositive = trend > 0;

    return (
        <div className="glass-card p-6 rounded-xl flex items-start justify-between">
            <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                {(subtext || trend) && (
                    <div className="flex items-center mt-2 gap-2">
                        {trend && (
                            <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {subtext && <span className="text-gray-400 text-sm">{subtext}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
