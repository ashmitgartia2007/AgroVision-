import React, { useState } from 'react';
import RadialProgress from './RadialProgress';
import ProgressBar from './ProgressBar';
import ImageAnalysis from './ImageAnalysis';
import type { FarmStatus, ImageAnalysisResponse } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SparklesIcon } from './icons/Icons';

interface OverviewProps {
    onAnalysisComplete: (status: FarmStatus) => void;
}

const Overview: React.FC<OverviewProps> = ({ onAnalysisComplete }) => {
    const { t } = useI18n();
    const [currentStatus, setCurrentStatus] = useState<FarmStatus | null>(null);
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    
    const handleAnalysis = (result: ImageAnalysisResponse) => {
        const newStatus = {
            ndvi_avg: result.estimated_ndvi,
            soil_moisture: result.estimated_soil_moisture,
        };
        setCurrentStatus(newStatus);
        onAnalysisComplete(newStatus); // Update global state for other components
        setAnalysisText(result.analysis_text);
    };

    const getNdviStatus = (value: number) => {
        if (value > 0.6) return { color: 'success' as const, label: t('healthy') };
        if (value > 0.3) return { color: 'warning' as const, label: t('average') };
        return { color: 'error' as const, label: t('poor') };
    };

    const getMoistureStatus = (value: number) => {
        if (value > 70) return { color: 'bg-info', label: t('saturated') };
        return { color: 'bg-success', label: t('optimal') };
    };
    
    const ndviStatus = currentStatus ? getNdviStatus(currentStatus.ndvi_avg) : null;
    const moistureStatus = currentStatus ? getMoistureStatus(currentStatus.soil_moisture) : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NDVI Gauge Card */}
                <div className="bg-base-100 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[280px]">
                    <h3 className="text-lg font-semibold text-primary-content mb-2">{t('ndvi')} (Avg)</h3>
                    {currentStatus && ndviStatus ? (
                        <>
                            <RadialProgress value={currentStatus.ndvi_avg} max={1} color={ndviStatus.color} />
                            <p className={`mt-4 text-xl font-bold text-${ndviStatus.color}`}>{ndviStatus.label}</p>
                            <p className="text-xs text-base-content mt-1">({t('estimatedFromImage')})</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-base-content flex-grow">
                             <RadialProgress value={0} max={1} color="primary" isWaiting={true} />
                            <p className="mt-4 font-semibold">{t('analysisRequired')}</p>
                        </div>
                    )}
                </div>

                {/* Soil Moisture Card */}
                <div className="bg-base-100 p-6 rounded-2xl shadow-lg flex flex-col justify-center min-h-[280px]">
                    <h3 className="text-lg font-semibold text-primary-content mb-4">{t('soilMoisture')}</h3>
                    {currentStatus && moistureStatus ? (
                        <>
                            <ProgressBar value={currentStatus.soil_moisture} color={moistureStatus.color} />
                            <div className="flex justify-between mt-2 text-sm">
                                <span>0%</span>
                                <span className={`font-bold ${moistureStatus.color.replace('bg-','text-')}`}>{currentStatus.soil_moisture}% ({moistureStatus.label})</span>
                                <span>100%</span>
                            </div>
                             <p className="text-xs text-base-content mt-1 text-center">({t('estimatedFromImage')})</p>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center text-base-content flex-grow">
                            <ProgressBar value={0} />
                            <p className="mt-4 font-semibold">{t('analysisRequired')}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <ImageAnalysis onAnalysisComplete={handleAnalysis} />
            
            {analysisText && (
                 <div className="bg-base-100 p-6 rounded-2xl shadow-lg animate-fade-in">
                    <h3 className="text-xl font-bold text-primary-content mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/>
                        {t('detailedAnalysis')}
                    </h3>
                    <p className="text-base-content whitespace-pre-wrap leading-relaxed">{analysisText}</p>
                </div>
            )}
        </div>
    );
};

export default Overview;