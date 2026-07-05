import type { ComponentType } from 'react';

export type Language = 'en' | 'hi' | 'mr';

export type TabID = 'overview' | 'trends' | 'weather' | 'ai-insights';

export interface Tab {
    id: TabID;
    labelKey: string;
    icon: ComponentType<{ className?: string }>;
}

export interface FarmStatus {
    ndvi_avg: number;
    soil_moisture: number;
}

export interface HistoricalDataPoint {
    date: string;
    ndvi: number;
    soil_moisture: number;
}

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type WeatherCondition = 'Sunny' | 'Mostly Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Storm' | 'Windy';

export interface CurrentWeather {
    temperature_celsius: number;
    condition_text: WeatherCondition;
    condition_icon: 'Sunny' | 'Cloudy' | 'Rain' | 'Storm';
    feels_like_celsius: number;
    high_celsius: number;
    low_celsius: number;
    temp_24h_change: number;
    qpf_mm: number;
    thunderstorm_probability_percent: number;
    rain_probability_percent: number;
    wind_chill_celsius: number;
    heat_index_celsius: number;
    visibility_km: number;
    cloud_cover_percent: number;
    wind_kph: number;
    wind_gust_kph: number;
    wind_direction_cardinal: WindDirection;
    relative_humidity_percent: number;
    dew_point_celsius: number;
    uv_index: number;
    air_pressure_hpa: number;
}


export interface Suggestion {
    title: string;
    detail: string;
    priority: 'High' | 'Medium' | 'Low';
}

export interface AIInsightResponse {
    overall_assessment: string;
    recommendations: Suggestion[];
}

export interface ImageAnalysisResponse {
    analysis_text: string;
    estimated_ndvi: number;
    estimated_soil_moisture: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type MapType = 'city' | 'farm';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}