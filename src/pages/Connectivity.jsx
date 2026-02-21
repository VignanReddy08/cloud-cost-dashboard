import { useState, useEffect } from 'react';
import { Save, Cloud, Shield, Bell, CheckCircle, AlertCircle, Key, Globe, Layout, User } from 'lucide-react';
import { api } from '../services/api';

export default function Connectivity() {
    const [provider, setProvider] = useState('AWS');
    const [displayName, setDisplayName] = useState('');
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretAccessKey, setSecretAccessKey] = useState('');
    const [sessionToken, setSessionToken] = useState('');
    const [accountId, setAccountId] = useState('');
    const [region, setRegion] = useState('us-east-1');
    const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    useEffect(() => {
        const savedCreds = localStorage.getItem('aws_credentials');
        if (savedCreds) {
            const parsed = JSON.parse(savedCreds);
            setAccessKeyId(parsed.accessKeyId);
            setSecretAccessKey(parsed.secretAccessKey); // In a real app, don't fill this back in for security
            if (parsed.sessionToken) setSessionToken(parsed.sessionToken);
            setRegion(parsed.region || 'us-east-1');
            setDisplayName(parsed.displayName || '');
            setAccountId(parsed.accountId || '');
        }

        const savedAlerts = localStorage.getItem('emailAlertsEnabled');
        if (savedAlerts !== null) {
            setEmailAlertsEnabled(savedAlerts === 'true');
        }
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const credentials = { accessKeyId, secretAccessKey, sessionToken, region };
            const verifyResponse = await api.verifyConnection(credentials);

            const detectedAccountId = verifyResponse.accountId || accountId;
            setAccountId(detectedAccountId);

            localStorage.setItem('aws_credentials', JSON.stringify({ ...credentials, accountId: detectedAccountId, displayName }));
            localStorage.setItem('emailAlertsEnabled', emailAlertsEnabled.toString());
            setMessage({ type: 'success', text: 'Connection verified and saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAlertToggle = () => {
        const newValue = !emailAlertsEnabled;
        setEmailAlertsEnabled(newValue);
        localStorage.setItem('emailAlertsEnabled', newValue.toString());
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-transparent dark:text-white bg-clip-text dark:bg-none bg-gradient-to-r from-blue-600 to-purple-600">Connectivity</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your cloud provider connections and unlock cost insights.</p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100/50 bg-white/40 dark:bg-gray-800/40 dark:border-gray-700/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Cloud className="w-6 h-6" />
                        </div>
                        Cloud Provider Integration
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Connect your cloud environments via read-only access to start tracking billing data seamlessly.</p>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Form Fields Section */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Layout className="w-4 h-4 text-gray-400" /> Provider
                                    </span>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                    >
                                        <option>AWS</option>
                                        <option disabled>Azure (Coming Soon)</option>
                                        <option disabled>Google Cloud (Coming Soon)</option>
                                    </select>
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" /> Display Name
                                    </span>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                        placeholder="e.g. Production AWS"
                                    />
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-gray-400" /> Region
                                    </span>
                                    <input
                                        type="text"
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none"
                                        placeholder="us-east-1"
                                    />
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Cloud className="w-4 h-4 text-gray-400" /> Account ID (Auto)
                                    </span>
                                    <input
                                        type="text"
                                        value={accountId}
                                        readOnly
                                        className="block w-full rounded-xl border-gray-200 bg-gray-100/50 dark:bg-gray-900/50 dark:border-gray-800 dark:text-gray-400 shadow-sm text-sm p-3 text-gray-500 cursor-not-allowed outline-none"
                                        placeholder="Fetched on save"
                                    />
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-100/50 dark:border-gray-700/50 space-y-6">
                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Key className="w-4 h-4 text-gray-400" /> Access Key ID
                                    </span>
                                    <input
                                        type="text"
                                        value={accessKeyId}
                                        onChange={(e) => setAccessKeyId(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none font-mono text-sm"
                                        placeholder="AKIA..."
                                    />
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-gray-400" /> Secret Access Key
                                    </span>
                                    <input
                                        type="password"
                                        value={secretAccessKey}
                                        onChange={(e) => setSecretAccessKey(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none font-mono text-sm"
                                        placeholder="••••••••••••••••••••••••••••••••"
                                    />
                                </label>

                                <label className="block space-y-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Key className="w-4 h-4 text-gray-400" /> Session Token (Optional)
                                    </span>
                                    <input
                                        type="password"
                                        value={sessionToken}
                                        onChange={(e) => setSessionToken(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white/60 dark:bg-gray-950 dark:border-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500/50 sm:text-sm p-3 transition-all duration-200 outline-none font-mono text-sm"
                                        placeholder="Required for temporary STS credentials"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Instructions Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl shadow-inner">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-600 dark:bg-blue-500/20 text-white dark:text-blue-400 rounded-lg shadow-sm">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Security First</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    We prioritize the security of your cloud environments. We strongly recommend creating a read-only IAM user exclusively for this integration.
                                </p>
                                <div className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-4 text-xs text-gray-700 dark:text-gray-400 font-mono shadow-sm">
                                    &#123;<br />
                                    &nbsp;&nbsp;"Version": "2012-10-17",<br />
                                    &nbsp;&nbsp;"Statement": [<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&#123;<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Effect": "Allow",<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Action": [<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"ce:GetCostAndUsage"<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"Resource": "*"<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                                    &nbsp;&nbsp;]<br />
                                    &#125;
                                </div>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm flex gap-3 items-center shadow-sm animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                            <p className="font-medium">{message.text}</p>
                        </div>
                    )}
                </div>

                <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Configuration</>
                        )}
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-100/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Bell className="w-6 h-6" />
                        </div>
                        Notification Preferences
                    </h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-gray-100/50 dark:border-gray-700/50 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Email Alerts</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Receive daily digests of cost anomalies and budget threshold breaches.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={emailAlertsEnabled}
                                onChange={handleEmailAlertToggle}
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

