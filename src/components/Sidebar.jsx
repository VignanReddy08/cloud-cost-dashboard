import { LayoutDashboard, Wallet, Bell, Lightbulb, Link as LinkIcon, LogOut, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Cost Explorer', href: '/cost-explorer', icon: Wallet },
    { name: 'Budgets & Alerts', href: '/budgets', icon: Bell },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { name: 'Connectivity', href: '/connectivity', icon: LinkIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col w-64 glass border-r border-white/20 h-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-100/50 dark:border-gray-700/50">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
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
                            className={`nav-item ${isActive
                                ? 'bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 backdrop-blur-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-100/50 dark:border-gray-700/50 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 text-sm bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold flex-shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn-danger-outline w-full justify-start"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}
