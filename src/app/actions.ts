'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { transformWeatherData, type WeatherData, type AirQuality, transformOwmForecastData } from '@/lib/weather-data';

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

async function fetchOwmForecastData(lat: number, lon: number): Promise<any> {
    const apiKey = process.env.OWM_API_KEY;
    if (!apiKey) {
        console.warn("OpenWeatherMap API key not found. Skipping forecast fetch.");
        return null;
    }
    // OWM One Call API provides daily and hourly forecasts
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,alerts&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            console.error(`OWM forecast request failed: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
         console.error("Error fetching OWM forecast data:", (error as Error).message);
         return null;
    }
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
        // 1. Fetch current weather from Weatherstack
        const weatherData = await fetchWeatherstackData(locationQuery);

        // Extract lat/lon from weatherstack response to use for forecast
        const { lat, lon, name } = weatherData.location;

        if (!cityForAirQuality) {
            cityForAirQuality = name;
        }
        
        // 2. Fetch air quality from API-Ninjas
        const airData = cityForAirQuality ? await getApiNinjasAirQuality(cityForAirQuality) : null;
        
        // 3. Fetch forecast data from OpenWeatherMap
        const forecastData = await fetchOwmForecastData(lat, lon);

        // 4. Transform all data
        return transformWeatherData(weatherData, airData, forecastData);

    } catch (error) {
        console.error("Error fetching real-time weather data:", (error as Error).message);
        // In case of any failure, we can return null and let the UI handle it.
        return null;
    }
}
