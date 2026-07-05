import type { CurrentWeather, WindDirection, WeatherCondition } from '../types';

const generateCurrentWeather = (): CurrentWeather => {
    const conditions: WeatherCondition[] = ['Sunny', 'Mostly Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Storm'];
    const windDirections: WindDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    
    // Add slight real-time variation
    const tempVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const baseTemp = 28 + Math.floor(Math.random() * 5) + tempVariation;

    return {
        temperature_celsius: baseTemp,
        condition_text: conditions[Math.floor(Math.random() * conditions.length)],
        condition_icon: 'Sunny', // simplified for mock
        feels_like_celsius: baseTemp + (Math.random() > 0.5 ? 1 : -1),
        high_celsius: baseTemp + 4,
        low_celsius: baseTemp - 5,
        temp_24h_change: Math.round((Math.random() * 4 - 2) * 10) / 10,
        qpf_mm: parseFloat((Math.random() * 2).toFixed(1)),
        thunderstorm_probability_percent: Math.floor(Math.random() * 20),
        rain_probability_percent: Math.floor(Math.random() * 40),
        wind_chill_celsius: baseTemp - Math.floor(Math.random() * 3),
        heat_index_celsius: baseTemp + Math.floor(Math.random() * 3),
        visibility_km: Math.floor(Math.random() * 10) + 5,
        cloud_cover_percent: Math.floor(Math.random() * 100),
        wind_kph: Math.floor(Math.random() * 20) + 5,
        wind_gust_kph: Math.floor(Math.random() * 20) + 25,
        wind_direction_cardinal: windDirections[Math.floor(Math.random() * windDirections.length)],
        relative_humidity_percent: Math.floor(Math.random() * 50) + 30,
        dew_point_celsius: parseFloat((baseTemp - (100 - (Math.floor(Math.random() * 50) + 30)) / 5).toFixed(1)),
        uv_index: Math.floor(Math.random() * 11),
        air_pressure_hpa: Math.floor(Math.random() * 20) + 1000,
    };
};

export const weatherService = {
    getCurrentWeather: (city: string): Promise<CurrentWeather> => {
        console.log(`Fetching mock current weather for ${city}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateCurrentWeather());
            }, 700);
        });
    },
};