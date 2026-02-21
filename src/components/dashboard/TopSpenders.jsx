import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TopSpenders({ data }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Spenders</h3>
            <div className="overflow-y-auto flex-1">
                <div className="space-y-4">
                    {data.map((item, index) => {
                        const isIncrease = item.change > 0;
                        return (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        {item.service.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.service}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Service</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 dark:text-white">${item.cost.toLocaleString()}</div>
                                    <div className={`text-xs flex items-center justify-end ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                                        {isIncrease ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                        {Math.abs(item.change)}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300">View All Services</button>
            </div>
        </div>
    );
}
