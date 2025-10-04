'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { getMockWeatherData, type WeatherData } from '@/lib/weather-data';

export async function getAiSummary(input: GenerateDailyWeatherSummaryInput): Promise<string> {
    try {
        const result = await generateDailyWeatherSummary(input);
        return result.summary;
    } catch (error) {
        console.error("AI summary generation failed:", error);
        return "Could not generate weather summary at this time.";
    }
}

export async function getAgriculturalAdvice(input: GenerateAgriculturalAdviceInput): Promise<GenerateAgriculturalAdviceOutput | null> {
    try {
        return await generateAgriculturalAdvice(input);
    } catch (error) {
        console.error("Agricultural advice generation failed:", error);
        return null;
    }
}

export async function getGlobalAlerts(): Promise<GenerateGlobalAlertsOutput | null> {
    try {
        return await generateGlobalAlerts();
    } catch (error) {
        console.error("Global alerts generation failed:", error);
        return null;
    }
}

export async function getRealtimeWeatherData(location: { lat: number, lon: number } | { city: string }): Promise<WeatherData | null> {
    try {
        // Using mock data to avoid API rate limiting issues during development
        if ('city' in location && location.city) {
             return getMockWeatherData(51.5072, -0.1276, location.city);
        }
        if('lat' in location && 'lon' in location) {
            return getMockWeatherData(location.lat, location.lon);
        }
        return getMockWeatherData(51.5072, -0.1276);
    } catch (error) {
        console.error("Error generating mock weather data:", error);
        return null;
    }
}
