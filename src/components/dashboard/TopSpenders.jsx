import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TopSpenders({ data }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Spenders</h3>
            <div className="overflow-y-auto flex-1">
                <div className="space-y-4">
                    {data.map((item, index) => {
                        const isIncrease = item.change > 0;
                        return (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {item.service.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{item.service}</div>
                                        <div className="text-xs text-gray-500">Service</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">${item.cost.toLocaleString()}</div>
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
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All Services</button>
            </div>
        </div>
    );
}
