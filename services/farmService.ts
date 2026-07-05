import type { FarmStatus, HistoricalDataPoint } from '../types';

let lastStatus: FarmStatus = {
    ndvi_avg: 0.78,
    soil_moisture: 62,
};

// Function to ensure values stay within a realistic range
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const generateHistoricalData = (): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), // e.g., 'Jul 20'
            ndvi: parseFloat((0.65 + Math.random() * 0.2).toFixed(2)),
            soil_moisture: Math.floor(50 + Math.random() * 25),
        });
    }
    return data;
};



export const farmService = {
    // Simulates fetching live, fluctuating data from sensors
    getFarmStatus: (): Promise<FarmStatus> => {
        return new Promise(resolve => {
            setTimeout(() => {
                // Apply a small random fluctuation
                lastStatus.ndvi_avg += (Math.random() - 0.5) * 0.02;
                lastStatus.soil_moisture += (Math.random() - 0.5) * 2;

                // Clamp values to keep them realistic
                lastStatus.ndvi_avg = clamp(lastStatus.ndvi_avg, 0.2, 0.9);
                lastStatus.soil_moisture = clamp(lastStatus.soil_moisture, 30, 85);
                
                // Return a new object to ensure react state updates
                resolve({
                    ndvi_avg: parseFloat(lastStatus.ndvi_avg.toFixed(2)),
                    soil_moisture: Math.round(lastStatus.soil_moisture),
                });
            }, 300); // Short delay to simulate network latency
        });
    },
    getHistoricalData: (): Promise<HistoricalDataPoint[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(generateHistoricalData());
            }, 1200);
        });
    },
};
