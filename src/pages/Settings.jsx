import { useState, useEffect } from 'react';
import { Save, Cloud, Shield, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Settings() {
    const [provider, setProvider] = useState('AWS');
    const [displayName, setDisplayName] = useState('');
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretAccessKey, setSecretAccessKey] = useState('');
    const [accountId, setAccountId] = useState('');
    const [region, setRegion] = useState('us-east-1');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }

    useEffect(() => {
        const savedCreds = localStorage.getItem('aws_credentials');
        if (savedCreds) {
            const parsed = JSON.parse(savedCreds);
            setAccessKeyId(parsed.accessKeyId);
            setSecretAccessKey(parsed.secretAccessKey); // In a real app, don't fill this back in for security
            setRegion(parsed.region || 'us-east-1');
            setDisplayName(parsed.displayName || '');
            setAccountId(parsed.accountId || '');
        }
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const credentials = { accessKeyId, secretAccessKey, region };
            const verifyResponse = await api.verifyConnection(credentials);

            // Use returned accountId if available
            const detectedAccountId = verifyResponse.accountId || accountId;
            setAccountId(detectedAccountId);

            // Save to localStorage (Note: In production, consider more secure storage or session-only)
            localStorage.setItem('aws_credentials', JSON.stringify({ ...credentials, accountId: detectedAccountId, displayName }));
            setMessage({ type: 'success', text: 'Connection verified and saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your cloud provider connections and application preferences.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-gray-400" />
                        Cloud Provider Integration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Connect your cloud accounts to fetch billing data.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Provider</span>
                                <select
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option>AWS</option>
                                    <option>Azure</option>
                                    <option>Google Cloud</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Display Name</span>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="e.g. Production AWS"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Region</span>
                                <input
                                    type="text"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="us-east-1"
                                />
                            </label>


                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Access Key ID</span>
                                    <input
                                        type="text"
                                        value={accessKeyId}
                                        onChange={(e) => setAccessKeyId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="AKIA..."
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Secret Access Key</span>
                                    <input
                                        type="password"
                                        value={secretAccessKey}
                                        onChange={(e) => setSecretAccessKey(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="••••••••••••••••"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Account ID (Auto-detected)</span>
                                    <input
                                        type="text"
                                        value={accountId}
                                        readOnly
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border text-gray-500 cursor-not-allowed"
                                        placeholder="Will be fetched on save"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex gap-3 items-start">
                            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>We recommend creating a read-only IAM user for this integration. We only require <code>CostExplorer:GetCostAndUsage</code> permissions.</p>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg text-sm flex gap-3 items-start ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                <p>{message.text}</p>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Verifying...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-gray-400" />
                            Notification Preferences
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Toggles placeholder */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">Email Alerts</h3>
                                <p className="text-sm text-gray-500">Receive daily digest of cost anomalies.</p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:bg-blue-600 checked:border-blue-600 right-0" />
                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
