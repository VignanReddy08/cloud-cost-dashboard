import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await forgotPassword(email);
            setStatus('success');
            // Wait slightly before redirecting so user can read message
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 3000);
        } catch (err) {
            setStatus('error');
            setErrorMessage(err.message || 'Failed to send reset code');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]"
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
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                    <p className="text-gray-400">Enter your email to receive a reset code</p>
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
                        <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                        <p className="text-gray-400 mb-6">
                            We've sent a 6-digit recovery code to <br />
                            <span className="text-white font-medium">{email}</span>
                        </p>
                        <p className="text-sm text-gray-500">Redirecting to reset page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee] hover:shadow-[0_0_20px_#22d3ee] rounded-xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending Code...
                                </>
                            ) : (
                                <>
                                    Send Reset Code
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-gray-400 text-sm">
                        Remember your password?{' '}
                        <Link to="/login" className="text-blue-400 font-semibold hover:underline">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
