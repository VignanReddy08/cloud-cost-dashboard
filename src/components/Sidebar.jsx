import { LayoutDashboard, Wallet, Bell, Lightbulb, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Cost Explorer', href: '/cost-explorer', icon: Wallet },
    { name: 'Budgets & Alerts', href: '/budgets', icon: Bell },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex flex-col w-64 glass border-r border-white/20 h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-100/50">
                <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    CloudCost
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50/80 text-blue-600 backdrop-blur-sm'
                                    : 'text-gray-600 hover:bg-gray-50/50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
