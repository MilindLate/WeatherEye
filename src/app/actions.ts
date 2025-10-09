'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { transformWeatherData, type WeatherData, type AirQuality } from '@/lib/weather-data';

export async function getAiSummary(input: GenerateDailyWeatherSummaryInput): Promise<string | null> {
    try {
        const result = await generateDailyWeatherSummary(input);
        return result.summary;
    } catch (error) {
        console.error("AI summary generation failed:", (error as Error).message);
        return null;
    }
}

export async function getAgriculturalAdvice(input: GenerateAgriculturalAdviceInput): Promise<GenerateAgriculturalAdviceOutput | null> {
    try {
        return await generateAgriculturalAdvice(input);
    } catch (error) {
        console.error("Agricultural advice generation failed:", (error as Error).message);
        return null;
    }
}

export async function getGlobalAlerts(): Promise<GenerateGlobalAlertsOutput | null> {
     try {
        return await generateGlobalAlerts();
    } catch (error) {
        console.error("Global alerts generation failed:", (error as Error).message);
        return null;
    }
}

async function getApiNinjasAirQuality(city: string): Promise<AirQuality | null> {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
        console.warn("API-Ninjas key not found. Skipping air quality fetch.");
        return null;
    }

    try {
        const url = `https://api.api-ninjas.com/v1/airquality?city=${city}`;
        const response = await fetch(url, { headers: { 'X-Api-Key': apiKey } });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`API Ninjas request failed for ${city}: ${response.status} ${response.statusText}`, errorBody);
            return null;
        }
        const data = await response.json();
        
        if (data.error || Object.keys(data).length === 0) {
             console.error(`API Ninjas returned an error for ${city}: ${data.error || 'Empty response'}`);
             return null;
        }
        
        const defaultPollutant = { concentration: 0, aqi: 0 };
        return {
            overall_aqi: data.overall_aqi ?? 0,
            CO: data.CO ?? defaultPollutant,
            NO2: data.NO2 ?? defaultPollutant,
            O3: data.O3 ?? defaultPollutant,
            SO2: data.SO2 ?? defaultPollutant,
            'PM2.5': data['PM2.5'] ?? defaultPollutant,
            PM10: data.PM10 ?? defaultPollutant,
        };

    } catch (error) {
        console.error("Error fetching API Ninjas air quality:", error);
        return null;
    }
}

async function fetchWeatherstackData(locationQuery: string): Promise<any> {
    const apiKey = process.env.WEATHERSTACK_KEY;
    if (!apiKey) {
        throw new Error("Weatherstack API key not found.");
    }
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${encodeURIComponent(locationQuery)}&units=m`;

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Weatherstack API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`Weatherstack error: ${data.error.info}`);
    }
    return data;
}

export async function getRealtimeWeatherData(location: { lat: number, lon: number } | { city: string }): Promise<WeatherData | null> {
    
    let locationQuery: string;
    let cityForAirQuality: string | undefined;

    if ('city' in location) {
        locationQuery = location.city;
        cityForAirQuality = location.city;
    } else {
        locationQuery = `${location.lat},${location.lon}`;
    }

    try {
        const weatherData = await fetchWeatherstackData(locationQuery);

        if (!cityForAirQuality) {
            cityForAirQuality = weatherData.location.name;
        }
        
        const airData = cityForAirQuality ? await getApiNinjasAirQuality(cityForAirQuality) : null;
        
        return transformWeatherData(weatherData, airData);

    } catch (error) {
        console.error("Error fetching real-time weather data:", (error as Error).message);
        // In case of any failure, we can return null and let the UI handle it.
        return null;
    }
}
