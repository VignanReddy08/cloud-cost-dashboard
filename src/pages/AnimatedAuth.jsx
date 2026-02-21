import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Loader2, Server, Shield, Zap } from 'lucide-react';

export default function AnimatedAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
                navigate('/');
            } else {
                await signup(name, email, password);
                navigate('/verify-email', { state: { email } });
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        // We keep email/password to save typing, but clear specific fields
        if (isLogin) {
            setName('');
            setConfirmPassword('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements - Removed motion elements due to linting and simplified */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px] animate-pulse-slow object-center" />
            </div>

            {/* Main Container */}
            <div className="w-full max-w-5xl h-[700px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-10 flex">

                {/* Sliding Overlay Panel (Left/Right) */}
                <div
                    className={`absolute top-0 h-full w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 z-20 flex flex-col justify-center px-12 text-white shadow-2xl hidden md:flex transition-all duration-700 ease-in-out ${isLogin ? 'left-1/2' : 'left-0'}`}
                >
                    <div
                        key={isLogin ? "login-overlay" : "signup-overlay"}
                        className="text-center animate-fade-in"
                    >
                        <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/30">
                            <Server className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-extrabold mb-4">
                            {isLogin ? "New Here?" : "Welcome Back!"}
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            {isLogin
                                ? "Sign up to discover advanced cloud cost analytics, real-time alerts, and optimization recommendations."
                                : "To keep connected with your cloud insights, please login with your personal info."}
                        </p>

                        <div className="flex justify-center gap-4 mb-12">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-yellow-300" />
                                </div>
                                <span className="text-xs font-medium text-blue-100">Fast Insights</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-300" />
                                </div>
                                <span className="text-xs font-medium text-blue-100">Secure</span>
                            </div>
                        </div>

                        <button
                            onClick={toggleMode}
                            className="px-8 py-3 rounded-xl border-2 border-white text-white font-bold hover:bg-white hover:text-blue-600 transition-colors duration-300 w-full max-w-xs mx-auto"
                        >
                            {isLogin ? "Create Account" : "Sign In"}
                        </button>
                    </div>
                </div>

                {/* Form Area - Login (Left Side of layout, underneath overlay when sliding right) */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 lg:p-12 relative z-10 overflow-hidden">
                    {isLogin && (
                        <div
                            key="login-form"
                            className="w-full max-w-md animate-fade-in-right"
                        >
                            <div className="text-center md:text-left mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Sign in to CloudCost</h2>
                                <p className="text-gray-400">Enter your details to proceed further</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in-up">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Email</label>
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

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-300">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">Forgot password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                </button>
                            </form>

                            {/* Mobile Toggle */}
                            <div className="mt-8 text-center md:hidden">
                                <p className="text-gray-400 text-sm">
                                    Don't have an account?{' '}
                                    <button onClick={toggleMode} className="text-blue-400 font-semibold hover:underline">Sign up</button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Area - Signup (Right Side of layout) */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 lg:p-12 relative z-10 overflow-hidden">
                    {!isLogin && (
                        <div
                            key="signup-form"
                            className="w-full max-w-md animate-fade-in-left"
                        >
                            <div className="text-center md:text-left mb-6">
                                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                                <p className="text-gray-400">Join us to optimize your cloud costs</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-4 flex items-center gap-3 animate-fade-in-up">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
                                </button>
                            </form>

                            {/* Mobile Toggle */}
                            <div className="mt-6 text-center md:hidden">
                                <p className="text-gray-400 text-sm">
                                    Already have an account?{' '}
                                    <button onClick={toggleMode} className="text-purple-400 font-semibold hover:underline">Sign in</button>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
