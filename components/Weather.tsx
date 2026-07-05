import React, { useState, useEffect, useCallback } from 'react';
import { weatherService } from '../services/weatherService';
import { geminiService } from '../services/geminiService';
import type { CurrentWeather, WeatherCondition } from '../types';
import { SunIcon, CloudyIcon, ZapIcon, CloudRainIcon, WindIcon, TrendingUpIcon, LightningIcon, RainDropIcon, ThermometerIcon, DropletsIcon, EyeIcon, GaugeIcon } from './icons/Icons';
import MetricCard from './MetricCard';
import UvIndexGauge from './UvIndexGauge';
import AirPressureGauge from './AirPressureGauge';
import { useI18n } from '../hooks/useI18n';
import { INDIAN_CITIES } from '../constants';

const WeatherConditionIcon = ({ condition, className }: { condition: WeatherCondition, className?: string }) => {
    switch (condition) {
        case 'Sunny':
        case 'Mostly Sunny':
             return <SunIcon className={className || "w-16 h-16 text-yellow-500"} />;
        case 'Partly Cloudy':
        case 'Cloudy':
             return <CloudyIcon className={className || "w-16 h-16 text-gray-500"} />;
        case 'Rain':
             return <CloudRainIcon className={className || "w-16 h-16 text-blue-500"} />;
        case 'Storm':
             return <ZapIcon className={className || "w-16 h-16 text-purple-500"} />;
        default:
             return <CloudyIcon className={className || "w-16 h-16 text-gray-500"} />;
    }
};

const Weather: React.FC = () => {
    const { t, language } = useI18n();
    const [weather, setWeather] = useState<CurrentWeather | null>(null);
    const [city, setCity] = useState('Nashik');
    const [view, setView] = useState<'today' | 'forecast' | 'history'>('today');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let data;
            if (view === 'forecast') {
                data = await geminiService.getFutureWeather(city, language);
            } else {
                data = await weatherService.getCurrentWeather(city);
            }
            setWeather(data);
        } catch (err) {
            setError(t('errorGenerating'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [city, view, language, t]);
    
    useEffect(() => {
        fetchWeather();
    }, [fetchWeather]);

    const renderMainCard = () => (
        <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start col-span-1 md:col-span-2 lg:col-span-3">
            <div className="flex-1">
                <h1 className="text-6xl font-bold text-gray-800">{weather!.temperature_celsius}°C</h1>
                <p className="text-lg text-gray-600 mt-2">{t('feelsLike')}: {weather!.feels_like_celsius}°</p>
                <div className="flex items-center text-sm text-gray-500 mt-4 space-x-4">
                    <div className="flex items-center">
                        <TrendingUpIcon className="w-4 h-4 mr-1"/>
                        <span>{t('temp24hChange')}: {weather!.temp_24h_change}°</span>
                    </div>
                     <div className="flex items-center">
                        <RainDropIcon className="w-4 h-4 mr-1"/>
                        <span>{t('qpf')}: {weather!.qpf_mm}mm</span>
                    </div>
                </div>
                 <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                    <div className="flex items-center">
                        <LightningIcon className="w-4 h-4 mr-1"/>
                        <span>{t('thunderstormProb')}: {weather!.thunderstorm_probability_percent}%</span>
                    </div>
                     <div className="flex items-center">
                        <RainDropIcon className="w-4 h-4 mr-1"/>
                        <span>{t('rainProb')}: {weather!.rain_probability_percent}%</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end text-right mt-4 sm:mt-0">
                <WeatherConditionIcon condition={weather!.condition_text as WeatherCondition} />
                <p className="text-xl font-semibold text-gray-800 mt-2">{weather!.condition_text}</p>
                <p className="text-gray-500">{t('high')}: {weather!.high_celsius}° {t('low')}: {weather!.low_celsius}°</p>
            </div>
        </div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-96 col-span-full">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                </div>
            );
        }
        if (error || !weather) {
            return (
                <div className="text-center text-error h-96 flex flex-col justify-center items-center col-span-full">
                    <p>{error || 'No weather data available.'}</p>
                    <button onClick={fetchWeather} className="mt-4 bg-error text-white font-bold py-2 px-4 rounded-lg">{t('retry')}</button>
                </div>
            );
        }
        return (
            <>
                {renderMainCard()}
                <MetricCard title={t('windChill')} icon={<ThermometerIcon className="w-5 h-5 text-blue-500" />}>
                    <p className="text-4xl font-bold text-gray-800">{weather.wind_chill_celsius}°</p>
                    <p className="text-sm text-gray-500">Cold relative to Wind</p>
                </MetricCard>
                <MetricCard title={t('heatIndex')} icon={<ThermometerIcon className="w-5 h-5 text-red-500" />}>
                    <p className="text-4xl font-bold text-gray-800">{weather.heat_index_celsius}°</p>
                    <p className="text-sm text-gray-500">Heat relative to % Humidity</p>
                </MetricCard>
                <MetricCard title={t('visibility')} icon={<EyeIcon className="w-5 h-5 text-gray-500" />}>
                    <p className="text-4xl font-bold text-gray-800">{weather.visibility_km}<span className="text-xl">km</span></p>
                </MetricCard>
                <MetricCard title={t('cloudCover')} icon={<CloudyIcon className="w-5 h-5 text-gray-500" />}>
                     <p className="text-4xl font-bold text-gray-800">{weather.cloud_cover_percent}<span className="text-xl">%</span></p>
                </MetricCard>
                <MetricCard title={t('wind')} icon={<WindIcon className="w-5 h-5 text-gray-500" />}>
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{weather.wind_kph} <span className="text-sm font-normal">km/h</span></p>
                            <p className="text-xs text-gray-500">{t('speed')}</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{weather.wind_gust_kph} <span className="text-sm font-normal">km/h</span></p>
                            <p className="text-xs text-gray-500">{t('gust')}</p>
                        </div>
                        <div className="text-center">
                            <WindIcon className="w-8 h-8 mx-auto" />
                            <p className="font-bold text-lg">{weather.wind_direction_cardinal}</p>
                            <p className="text-xs text-gray-500">{t('direction')}</p>
                        </div>
                    </div>
                </MetricCard>
                <MetricCard title={t('relativeHumidity')} icon={<DropletsIcon className="w-5 h-5 text-blue-400" />}>
                    <p className="text-4xl font-bold text-gray-800">{weather.relative_humidity_percent}<span className="text-xl">%</span></p>
                    <p className="text-xs text-gray-500 mt-2">{t('dewPoint')} {weather.dew_point_celsius}°</p>
                </MetricCard>
                 <MetricCard title={t('uvIndex')} icon={<SunIcon className="w-5 h-5 text-yellow-500" />}>
                    <UvIndexGauge value={weather.uv_index} maxValue={11} />
                    <p className="text-xs text-gray-500 mt-2 text-center">{t('uvIndexDesc')}</p>
                </MetricCard>
                <MetricCard title={t('airPressure')} icon={<GaugeIcon className="w-5 h-5 text-gray-500" />}>
                    <AirPressureGauge value={weather.air_pressure_hpa} />
                    <p className="text-xs text-gray-500 mt-2 text-center">{t('airPressureDesc')}</p>
                </MetricCard>
            </>
        )
    };
    
    return (
        <div className="bg-gray-100 p-4 rounded-2xl">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                 <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-200">
                    <button onClick={() => setView('today')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'today' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-300'}`}>{t('today')}</button>
                    <button onClick={() => setView('forecast')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'forecast' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-300'}`}>{t('forecast')}</button>
                    <button onClick={() => setView('history')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${view === 'history' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-300'}`}>{t('history')}</button>
                </div>
                <select 
                    value={city} 
                    onChange={(e) => { setCity(e.target.value); }}
                    className="bg-white border border-gray-300 text-gray-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default Weather;