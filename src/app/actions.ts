'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { transformWeatherData, type WeatherData } from '@/lib/weather-data';

async function fetchFromOWM(url: string) {
    const OWM_API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;
    if (!OWM_API_KEY) {
        throw new Error("OpenWeatherMap API key is missing.");
    }
    const res = await fetch(`${url}&appid=${OWM_API_KEY}&units=metric`);
    if (!res.ok) {
        const errorData = await res.json();
        console.error("OWM API Error:", errorData);
        throw new Error(`Failed to fetch data from OWM: ${errorData.message}`);
    }
    return res.json();
}

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

async function getWeatherDataByCoords(lat: number, lon: number): Promise<WeatherData | null> {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}`;
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
     try {
        const [weatherData, forecastData, airPollutionData] = await Promise.all([
            fetchFromOWM(weatherUrl),
            fetchFromOWM(forecastUrl),
            fetchFromOWM(airPollutionUrl)
        ]);

        return transformWeatherData(weatherData, forecastData, airPollutionData);

    } catch (error) {
        console.error("Error fetching weather data by coords:", error);
        return null;
    }
}


async function getWeatherDataByCity(city: string): Promise<WeatherData | null> {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}`;
        const weatherData = await fetchFromOWM(weatherUrl);

        if (weatherData && weatherData.coord) {
            const { lat, lon } = weatherData.coord;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}`;
            const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;

            const [forecastData, airPollutionData] = await Promise.all([
                fetchFromOWM(forecastUrl),
                fetchFromOWM(airPollutionUrl)
            ]);
            
            return transformWeatherData(weatherData, forecastData, airPollutionData);
        }
        return null;

    } catch (error) {
        console.error(`Error fetching weather data for city "${city}":`, error);
        return null;
    }
}


export async function getRealtimeWeatherData(location: { lat: number, lon: number } | { city: string }): Promise<WeatherData | null> {
    if ('city' in location) {
        return getWeatherDataByCity(location.city);
    } else if ('lat' in location && 'lon' in location) {
        return getWeatherDataByCoords(location.lat, location.lon);
    }
    return null;
}
