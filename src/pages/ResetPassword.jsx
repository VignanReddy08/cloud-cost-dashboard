import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const location = useLocation();

    // Better to initialize state directly from location to avoid setting state in effect
    const [email] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    // Initialize email from location state
    useEffect(() => {
        // We initialize email in state during the first mount based on location
        // No need to set it on every render, and setting it during initial state is better
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            return setErrorMessage('Passwords do not match');
        }

        setStatus('loading');
        try {
            await resetPassword(email, code, password);
            setStatus('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]"
                />
            </div>

            {/* Main Container */}
            <div
                className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10 animate-fade-in-up"
            >
                <div className="text-center mb-8">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Create New Password</h2>
                    <p className="text-gray-400">Enter the 6-digit code sent to your email</p>
                </div>

                {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                )}

                {status === 'success' ? (
                    <div className="text-center py-6 animate-scale-in">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
                        <p className="text-gray-400 mb-6">Your password has been changed successfully.</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Verification Code</label>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-center tracking-[0.5em] font-mono text-xl"
                                placeholder="------"
                                maxLength={6}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {!location.state?.email && (
                            <div className="pt-2 text-sm text-yellow-500 text-center">
                                Warning: Email address is missing from the previous step. Please go back and resubmit your email.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee] rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                        >
                            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-gray-400 text-sm">
                        <Link to="/login" className="text-purple-400 font-semibold hover:underline">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
