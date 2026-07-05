import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import type { AIInsightResponse, FarmStatus, Coordinates } from '../types';
import SuggestionCard from './SuggestionCard';
import { useI18n } from '../hooks/useI18n';
import { SparklesIcon } from './icons/Icons';

type Status = 'idle' | 'locating' | 'loading' | 'success' | 'error';

interface AIInsightsProps {
    farmStatus: FarmStatus | null;
}

const AIInsights: React.FC<AIInsightsProps> = ({ farmStatus }) => {
    const { t, language } = useI18n();
    const [insights, setInsights] = useState<AIInsightResponse | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [locationMessage, setLocationMessage] = useState<string | null>(null);
    
    const handleGenerateInsights = useCallback(async () => {
        if (!farmStatus) return;

        setStatus('locating');
        setLocationMessage(null);
        
        new Promise<Coordinates | null>((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                    (error) => {
                        console.warn("Geolocation error:", error.message);
                        setLocationMessage(t('locationPermissionDenied'));
                        resolve(null);
                    }
                );
            } else {
                resolve(null);
            }
        }).then(async (coordinates) => {
            setStatus('loading');
            try {
                const result = await geminiService.getAISuggestions(farmStatus, language, coordinates);
                setInsights(result);
                setStatus('success');
            } catch (error) {
                console.error("Failed to get AI insights:", error);
                setStatus('error');
            } finally {
                setLocationMessage(null);
            }
        });

    }, [farmStatus, language, t]);
    
    const renderContent = () => {
        switch (status) {
            case 'locating':
                 return (
                    <div className="text-center p-8">
                        <p className="animate-pulse">{t('fetchingLocation')}</p>
                    </div>
                );
            case 'loading':
                return (
                    <div className="text-center p-8">
                         {locationMessage && <p className="text-sm text-warning mb-4">{locationMessage}</p>}
                        <div className="flex justify-center items-center gap-2 text-primary-content">
                            <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
                        </div>
                        <p className="mt-4">{t('generatingInsights')}</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center p-8">
                        <p className="text-error mb-4">{t('errorGenerating')}</p>
                        <button onClick={handleGenerateInsights} className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-2 px-4 rounded-lg">
                            {t('retry')}
                        </button>
                    </div>
                );
            case 'success':
                if (!insights) return null;
                return (
                    <div className="p-6">
                        <div className="bg-base-200 p-6 rounded-2xl mb-6">
                            <h4 className="text-lg font-semibold text-primary-content mb-2">{t('overallAssessment')}</h4>
                            <blockquote className="border-l-4 border-primary pl-4 italic text-base-content">
                                {insights.overall_assessment}
                            </blockquote>
                        </div>
                        <h4 className="text-lg font-semibold text-primary-content mb-4">{t('recommendations')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {insights.recommendations.map((rec, index) => (
                                <SuggestionCard key={index} suggestion={rec} />
                            ))}
                        </div>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center p-8 flex flex-col items-center">
                        <SparklesIcon className="w-16 h-16 text-primary mb-4" />
                        <h3 className="text-xl font-bold text-primary-content mb-4">Unlock Actionable Insights</h3>
                        {farmStatus ? (
                           <p className="max-w-md mx-auto mb-6">Get personalized recommendations for your farm based on the latest data by leveraging generative AI.</p>
                        ) : (
                           <p className="max-w-md mx-auto mb-6 text-warning">Live farm data is loading. Please wait a moment...</p>
                        )}
                        <button onClick={handleGenerateInsights} className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform hover:scale-105 disabled:bg-neutral disabled:cursor-not-allowed disabled:transform-none" disabled={!farmStatus}>
                            <SparklesIcon className="w-5 h-5" />
                            {t('getAISuggestions')}
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-base-100 min-h-[400px] rounded-2xl shadow-lg flex flex-col justify-center">
            {renderContent()}
        </div>
    );
};

export default AIInsights;