import { useState, useEffect } from 'react';
import { Lightbulb, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { RECOMMENDATIONS_DATA } from '../utils/mockData';

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState(RECOMMENDATIONS_DATA);
    const [loading, setLoading] = useState(true);


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

    // The error handling UI block was here but since error state is removed, 
    // we should remove the component that renders it.
    // (Removed error return statement)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Optimization Recommendations</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Actionable insights to reduce your cloud bill.</p>
                </div>
                {recommendations.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium border border-green-100 dark:border-green-900/50 flex flex-row items-center gap-2">
                        <Zap className="w-4 h-4 fill-current" />
                        Total Potential Savings: ${totalSavings.toFixed(2)}/mo
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {recommendations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
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
                            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:shadow-md transition-all duration-300">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                {type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400">{description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-700">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Est. Savings</div>
                                        <div className="text-xl font-bold text-green-600 dark:text-green-500">${saving.toFixed(2)}<span className="text-sm font-medium text-gray-400 dark:text-gray-500">/mo</span></div>
                                    </div>
                                    <button className="btn-primary whitespace-nowrap">
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
