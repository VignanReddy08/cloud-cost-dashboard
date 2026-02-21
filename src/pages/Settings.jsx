import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Lock, AlertTriangle, Save, Trash2, CheckCircle, AlertCircle, Moon, Sun, Palette } from 'lucide-react';

export default function Settings() {
    const { user, updateProfile, changePassword, deleteAccount } = useAuth();
    const { theme, toggleTheme, neonMode, toggleNeonMode, neonHoverMode, toggleNeonHoverMode } = useTheme();

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState(null);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState(null);

    // Delete Account State
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileMessage(null);
        try {
            await updateProfile(name, email);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setIsPasswordLoading(true);
        setPasswordMessage(null);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleteLoading(true);
        setDeleteMessage(null);
        try {
            await deleteAccount();
            // AuthContext will handle logout and redirect
        } catch (error) {
            setDeleteMessage({ type: 'error', text: error.message || 'Failed to delete account' });
            setIsDeleteLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Account Settings</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">Manage your profile, security preferences, and account status.</p>
            </div>

            {/* Profile Section */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100/50 bg-white/40">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        Profile Information
                    </h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" /> Full Name
                            </span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                placeholder="Your Full Name"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" /> Email Address
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                placeholder="your@email.com"
                            />
                        </label>
                    </div>

                    {profileMessage && (
                        <div className={`p-4 rounded-xl text-sm flex gap-3 items-center shadow-sm animate-in zoom-in-95 duration-300 ${profileMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {profileMessage.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="font-medium">{profileMessage.text}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-100/50">
                        <button
                            type="submit"
                            disabled={isProfileLoading}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 transition-all active:scale-95 ${!neonMode ? 'shadow-md shadow-blue-500/20 focus:ring-blue-500' : neonHoverMode ? 'border-2 border-transparent hover:border-cyan-400 hover:shadow-[0_0_10px_#22d3ee] focus:ring-cyan-400' : 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee] focus:ring-cyan-400'}`}
                        >
                            {isProfileLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="w-4 h-4" /> Save Changes</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Appearance Section */}
            <div className="glass-card rounded-2xl overflow-hidden mt-8 dark:bg-gray-800/80 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-100/50 bg-white/40 dark:border-gray-700/50 dark:bg-gray-800/40">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                            <Palette className="w-6 h-6" />
                        </div>
                        Appearance
                    </h2>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme Preference</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose how the dashboard looks to you.</p>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                        >
                            <span className="sr-only">Toggle theme</span>
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-sm flex items-center justify-center ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            >
                                {theme === 'dark' ? (
                                    <Moon className="w-4 h-4 text-indigo-600" />
                                ) : (
                                    <Sun className="w-4 h-4 text-orange-400" />
                                )}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100/50 dark:border-gray-700/50">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Neon UI Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable neon glowing borders for action buttons throughout the app.</p>
                        </div>

                        <button
                            type="button"
                            onClick={toggleNeonMode}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${neonMode ? 'bg-cyan-500 shadow-[0_0_8px_#22d3ee]' : 'bg-gray-300'
                                }`}
                        >
                            <span className="sr-only">Toggle Neon Mode</span>
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-sm ${neonMode ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {neonMode && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-top-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Neon on Hover Only</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Show the neon border effect only when hovering over buttons.</p>
                            </div>

                            <button
                                type="button"
                                onClick={toggleNeonHoverMode}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${neonHoverMode ? 'bg-cyan-500 shadow-[0_0_8px_#22d3ee]' : 'bg-gray-300'
                                    }`}
                            >
                                <span className="sr-only">Toggle Neon Hover Mode</span>
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all shadow-sm ${neonHoverMode ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Security Section */}
            <div className="glass-card rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-100/50 bg-white/40">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Lock className="w-6 h-6" />
                        </div>
                        Security & Password
                    </h2>
                </div>

                <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
                    <div className="max-w-md space-y-6">
                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" /> Current Password
                            </span>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                required
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" /> New Password
                            </span>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                required
                                minLength={6}
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" /> Confirm New Password
                            </span>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                required
                            />
                        </label>
                    </div>

                    {passwordMessage && (
                        <div className={`max-w-md p-4 rounded-xl text-sm flex gap-3 items-center shadow-sm animate-in zoom-in-95 duration-300 ${passwordMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {passwordMessage.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="font-medium">{passwordMessage.text}</p>
                        </div>
                    )}

                    <div className="flex justify-start pt-4 border-t border-gray-100/50">
                        <button
                            type="submit"
                            disabled={isPasswordLoading}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 transition-all active:scale-95 ${!neonMode ? 'shadow-md shadow-purple-500/20 focus:ring-purple-500' : neonHoverMode ? 'border-2 border-transparent hover:border-cyan-400 hover:shadow-[0_0_10px_#22d3ee] focus:ring-cyan-400' : 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee] focus:ring-cyan-400'}`}
                        >
                            {isPasswordLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                            ) : (
                                <><Lock className="w-4 h-4" /> Update Password</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl overflow-hidden mt-8 border-2 border-red-100 bg-white/80 shadow-sm">
                <div className="p-6 border-b border-red-100 bg-red-50/50">
                    <h2 className="text-xl font-bold text-red-700 flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        Danger Zone
                    </h2>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-sm text-gray-600">
                        Once you delete your account, there is no going back. Please be certain. All data associated with this account will be permanently removed.
                    </p>

                    {deleteMessage && (
                        <div className="p-4 rounded-xl text-sm flex gap-3 items-center shadow-sm bg-red-50 border border-red-200 text-red-700 animate-in zoom-in-95 duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{deleteMessage.text}</p>
                        </div>
                    )}

                    {!showDeleteConfirm ? (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-white text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all active:scale-95 ${!neonMode ? 'border border-red-200 shadow-sm' : neonHoverMode ? 'border-2 border-transparent hover:border-cyan-400 hover:shadow-[0_0_10px_#22d3ee]' : 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee]'}`}
                        >
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-4 animate-in fade-in zoom-in-95">
                            <p className="text-sm font-medium text-red-800">
                                Are you absolutely sure? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleteLoading}
                                    className={`flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-70 ${!neonMode ? 'shadow-md shadow-red-500/20' : neonHoverMode ? 'border-2 border-transparent hover:border-cyan-400 hover:shadow-[0_0_10px_#22d3ee]' : 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee]'}`}
                                >
                                    {isDeleteLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                                    ) : (
                                        'Yes, delete my account'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleteLoading}
                                    className={`px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all ${!neonMode ? '' : neonHoverMode ? 'border-2 border-transparent hover:border-cyan-400 hover:shadow-[0_0_10px_#22d3ee]' : 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee]'}`}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
