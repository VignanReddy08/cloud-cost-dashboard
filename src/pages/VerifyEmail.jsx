
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(0);

    const { verifyEmail, resendCode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let interval;
        if (resendDisabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
        }
        return () => clearInterval(interval);
    }, [resendDisabled, timer]);

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setResendDisabled(true);
        setTimer(60); // 60 seconds cooldown

        try {
            await resendCode(email);
            setSuccess('Verification code resent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to resend code');
            setResendDisabled(false);
            setTimer(0);
        }
    };

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting verification code', { email, code });
        setError('');
        setLoading(true);
        try {
            const cleanEmail = email ? email.trim() : '';
            const cleanCode = code ? code.trim() : '';

            if (!cleanEmail) {
                throw new Error('Email is required');
            }
            if (!cleanCode) {
                throw new Error('Verification code is required');
            }

            await verifyEmail(cleanEmail, cleanCode);
            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                    <p className="text-gray-500 mt-2">
                        We sent a verification code to <span className="font-medium text-gray-900">{email || 'your email'}</span>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!location.state?.email && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input
                            type="text"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
                            placeholder="123456"
                            maxLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none w-full mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendDisabled || loading}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendDisabled ? `Resend Code in ${timer}s` : 'Resend Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
