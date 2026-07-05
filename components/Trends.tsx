
import React, { useState, useEffect } from 'react';
import TrendChart from './TrendChart';
import { farmService } from '../services/farmService';
import type { HistoricalDataPoint } from '../types';
import { useI18n } from '../hooks/useI18n';

type ChartView = 'ndvi' | 'soil_moisture';

const Trends: React.FC = () => {
    const { t } = useI18n();
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<ChartView>('ndvi');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await farmService.getHistoricalData();
            setHistoricalData(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
         return (
            <div className="flex justify-center items-center h-96 bg-base-100 rounded-2xl">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
            </div>
        );
    }
    
    const chartData = historicalData.map(d => ({
        date: d.date,
        value: view === 'ndvi' ? d.ndvi : d.soil_moisture
    }));

    return (
        <div className="bg-base-100 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary-content">{view === 'ndvi' ? t('ndviTrend') : t('soilMoistureTrend')}</h3>
                <div className="flex items-center gap-2 p-1 rounded-lg bg-base-300">
                    <button 
                        onClick={() => setView('ndvi')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'ndvi' ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'}`}
                    >
                        {t('ndvi')}
                    </button>
                    <button 
                        onClick={() => setView('soil_moisture')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'soil_moisture' ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'}`}
                    >
                        {t('soilMoisture')}
                    </button>
                </div>
            </div>
            <TrendChart 
                data={chartData} 
                dataKey="value" 
                color={view === 'ndvi' ? '#36D399' : '#3ABFF8'}
            />
        </div>
    );
};

export default Trends;
