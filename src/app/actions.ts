'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { transformWeatherData, type WeatherData } from '@/lib/weather-data';


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

export async function getRealtimeWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    const OWM_API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;
    if (!OWM_API_KEY) {
        console.error("OpenWeatherMap API key is missing.");
        return null;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`;
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`;

    try {
        const [weatherRes, forecastRes, airPollutionRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl),
            fetch(airPollutionUrl)
        ]);

        if (!weatherRes.ok || !forecastRes.ok || !airPollutionRes.ok) {
            console.error("Failed to fetch weather data");
            return null;
        }

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();
        const airPollutionData = await airPollutionRes.json();

        return transformWeatherData(weatherData, forecastData, airPollutionData);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}
