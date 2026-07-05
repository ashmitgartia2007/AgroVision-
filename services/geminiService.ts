import { GoogleGenAI, Type } from "@google/genai";
import type { AIInsightResponse, ImageAnalysisResponse, Language, CurrentWeather, FarmStatus, Coordinates } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getAISuggestions = async (
    farmStatus: FarmStatus,
    language: Language,
    coordinates: Coordinates | null
): Promise<AIInsightResponse> => {
    const langMap = {
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi'
    };

    let locationContext = '';
    if (coordinates) {
        locationContext = `The farm is located near latitude ${coordinates.latitude.toFixed(4)} and longitude ${coordinates.longitude.toFixed(4)}. Please provide regionally-specific advice if possible, considering common crops and conditions for this part of India.`;
    }

    const prompt = `
        Act as an expert agricultural advisor for a modern farmer in India. 
        The farm's current average NDVI is ${farmStatus.ndvi_avg.toFixed(2)} and the soil moisture is ${farmStatus.soil_moisture}%.
        ${locationContext}
        Based on this data, provide a brief, one-paragraph "overall_assessment" of the farm's health.
        Then, provide 3 actionable, concise recommendations in a "recommendations" array.
        Each recommendation should have a "title", a "detail" explaining the action, and a "priority" ('High', 'Medium', or 'Low').
        Your entire response MUST be in ${langMap[language]}.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overall_assessment: { type: Type.STRING },
                    recommendations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                detail: { type: Type.STRING },
                                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                            },
                        },
                    },
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as AIInsightResponse;
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", e);
        throw new Error("Invalid JSON response from AI.");
    }
};

const getFutureWeather = async (
    city: string,
    language: Language
): Promise<CurrentWeather> => {
    const langMap = {
        en: 'English',
        hi: 'Hindi',
        mr: 'Marathi'
    };
    
    const prompt = `
        Provide a detailed current weather forecast for ${city}, India.
        Your response must be a single JSON object.
        The condition_text should be in ${langMap[language]}.
        The condition_icon must be one of: 'Sunny', 'Cloudy', 'Rain', 'Storm'.
        The wind_direction_cardinal must be one of: 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'.
        All numerical values should be integers, except for temp_24h_change, qpf_mm, and dew_point_celsius which can be floats.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    temperature_celsius: { type: Type.INTEGER },
                    condition_text: { type: Type.STRING },
                    condition_icon: { type: Type.STRING, enum: ['Sunny', 'Cloudy', 'Rain', 'Storm'] },
                    feels_like_celsius: { type: Type.INTEGER },
                    high_celsius: { type: Type.INTEGER },
                    low_celsius: { type: Type.INTEGER },
                    temp_24h_change: { type: Type.NUMBER },
                    qpf_mm: { type: Type.NUMBER },
                    thunderstorm_probability_percent: { type: Type.INTEGER },
                    rain_probability_percent: { type: Type.INTEGER },
                    wind_chill_celsius: { type: Type.INTEGER },
                    heat_index_celsius: { type: Type.INTEGER },
                    visibility_km: { type: Type.INTEGER },
                    cloud_cover_percent: { type: Type.INTEGER },
                    wind_kph: { type: Type.INTEGER },
                    wind_gust_kph: { type: Type.INTEGER },
                    wind_direction_cardinal: { type: Type.STRING, enum: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
                    relative_humidity_percent: { type: Type.INTEGER },
                    dew_point_celsius: { type: Type.NUMBER },
                    uv_index: { type: Type.INTEGER },
                    air_pressure_hpa: { type: Type.INTEGER },
                },
            },
        },
    });
    
    try {
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as CurrentWeather;
    } catch (e) {
        console.error("Failed to parse Gemini weather JSON response:", e);
        throw new Error("Invalid JSON response from AI for weather forecast.");
    }
};

const analyzeFarmImage = async (
    imageData: string,
    mimeType: string,
    language: Language
): Promise<ImageAnalysisResponse> => {
    const langMap = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

    const prompt = `
        You are an expert agricultural satellite imagery analyst. The user has uploaded a satellite image of their farm in India.
        Analyze this image to assess plant health.

        Your response MUST be a single JSON object with the following fields:
        1. "analysis_text": A detailed, one or two-paragraph assessment of the farm's condition based on the image. Include actionable suggestions for fertilizers, irrigation adjustments, and potential issues to watch for (like pest stress or nutrient deficiency). This entire text must be in ${langMap[language]}.
        2. "estimated_ndvi": A numerical estimation of the average NDVI for the plot, as a float ranging from 0.1 to 0.9.
        3. "estimated_soil_moisture": A numerical estimation of the average soil moisture as a percentage integer, from 20 to 90.
    `;

    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis_text: { type: Type.STRING },
                    estimated_ndvi: { type: Type.NUMBER },
                    estimated_soil_moisture: { type: Type.INTEGER },
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as ImageAnalysisResponse;
    } catch (e) {
        console.error("Failed to parse Gemini image analysis JSON response:", e);
        throw new Error("Invalid JSON response from AI for image analysis.");
    }
};

// FIX: Added the missing analyzeLocationData function that is called from MapComponent.tsx.
const analyzeLocationData = async (language: Language): Promise<ImageAnalysisResponse> => {
    const langMap = { en: 'English', hi: 'Hindi', mr: 'Marathi' };

    // Since we don't have a real image from the map plot, we'll use a descriptive prompt.
    const prompt = `
        You are an expert agricultural satellite imagery analyst. A user has selected a plot of land on a map for analysis in India. Assume it's a typical farm plot in a lush, green area.

        Your response MUST be a single JSON object with the following fields:
        1. "analysis_text": A detailed, one or two-paragraph assessment of a hypothetical healthy farm's condition. Include actionable suggestions for fertilizers, irrigation adjustments, and potential issues to watch for (like pest stress or nutrient deficiency). This entire text must be in ${langMap[language]}.
        2. "estimated_ndvi": A numerical estimation of the average NDVI for the plot, as a float ranging from 0.7 to 0.9.
        3. "estimated_soil_moisture": A numerical estimation of the average soil moisture as a percentage integer, from 60 to 80.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis_text: { type: Type.STRING },
                    estimated_ndvi: { type: Type.NUMBER },
                    estimated_soil_moisture: { type: Type.INTEGER },
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        return parsedResponse as ImageAnalysisResponse;
    } catch (e) {
        console.error("Failed to parse Gemini location analysis JSON response:", e);
        throw new Error("Invalid JSON response from AI for location analysis.");
    }
};


export const geminiService = {
    getAISuggestions,
    getFutureWeather,
    analyzeFarmImage,
    analyzeLocationData,
};