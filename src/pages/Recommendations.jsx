import { useState, useEffect } from 'react';
import { Lightbulb, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { RECOMMENDATIONS_DATA } from '../utils/mockData';

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState(RECOMMENDATIONS_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const savedCreds = localStorage.getItem('aws_credentials');
            if (!savedCreds) {
                // throw new Error('AWS credentials not found. Please configure them in Settings.');
                console.log('No credentials found, using mock data');
                setRecommendations(RECOMMENDATIONS_DATA);
                return;
            }
            const credentials = JSON.parse(savedCreds);

            const data = await api.getRecommendations(credentials);
            setRecommendations(data);
        } catch (err) {
            console.error(err);
            // setError(err.message);
            console.warn('Failed to fetch recommendations, using mock data');
            setRecommendations(RECOMMENDATIONS_DATA);
        } finally {
            setLoading(false);
        }
    };

    // Calculate total potential savings
    const totalSavings = recommendations.reduce((acc, rec) => {
        // AWS Structure: RightsizingRecommendation -> TerminateRecommendationDetail or ModifyRecommendationDetail
        // We'll try to extract estimated savings. Structure varies.
        // Simplified extraction for demo:
        let saving = 0;
        if (rec.TerminateRecommendationDetail) {
            saving = parseFloat(rec.TerminateRecommendationDetail.EstimatedMonthlySavings || 0);
        } else if (rec.ModifyRecommendationDetail) {
            // Look for TargetInstances
            // This is complex, so we'll defaults to 0 if not easily parsed
            saving = 0;
        }
        return acc + saving;
    }, 0);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load recommendations</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <button
                    onClick={fetchRecommendations}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Optimization Recommendations</h1>
                    <p className="text-sm text-gray-500 mt-1">Actionable insights to reduce your cloud bill.</p>
                </div>
                {recommendations.length > 0 && (
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium border border-green-100 flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-current" />
                        Total Potential Savings: ${totalSavings.toFixed(2)}/mo
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {recommendations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                        No optimization recommendations found at this time.
                    </div>
                ) : (
                    recommendations.map((rec, index) => {
                        // Map AWS response to UI model
                        // This is a simplification. Real AWS Rightsizing response is complex.
                        const type = rec.RightsizingType || 'Right-sizing';
                        const title = `${type} Recommendation`;
                        const description = `Consider modifying resources in account ${rec.AccountId}`;

                        let saving = 0;
                        if (rec.TerminateRecommendationDetail) {
                            saving = parseFloat(rec.TerminateRecommendationDetail.EstimatedMonthlySavings || 0);
                        }

                        return (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                {type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600">{description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Est. Savings</div>
                                        <div className="text-xl font-bold text-green-600">${saving.toFixed(2)}<span className="text-sm font-medium text-gray-400">/mo</span></div>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap">
                                        Review <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
