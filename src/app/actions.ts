'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { getMockWeatherData, transformWeatherData, type WeatherData, type AirQuality } from '@/lib/weather-data';

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

async function fetchOwmData(url: URL, apiKey: string) {
    if (!apiKey) {
        throw new Error('OWM API key is missing.');
    }
    url.searchParams.set('appid', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`OWM API request failed: ${res.statusText}`);
    }
    return res.json();
}

async function getOwmGeoData(location: { city: string }, apiKey: string): Promise<{lat: number, lon: number, name: string} | null> {
    const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
    geoUrl.searchParams.set('q', location.city);
    geoUrl.searchParams.set('limit', '1');
    try {
        const geoData = await fetchOwmData(geoUrl, apiKey);
        if (!geoData || geoData.length === 0) return null;
        return { lat: geoData[0].lat, lon: geoData[0].lon, name: geoData[0].name };
    } catch (error) {
        console.error(`Geocoding with key failed:`, (error as Error).message);
        return null;
    }
}

export async function getRealtimeWeatherData(location: { lat: number, lon: number } | { city: string }): Promise<WeatherData | null> {
    const primaryKey = process.env.OWM_API_KEY!;
    const fallbackKey = process.env.OWM_API_KEY_FALLBACK!;
    
    let lat: number, lon: number;
    let city: string | undefined;
    
    let activeKey = primaryKey;

    if ('city' in location) {
        city = location.city;
        let geoData = await getOwmGeoData({ city }, activeKey);
        
        if (!geoData) {
            console.warn("Primary geocoding key failed, trying fallback.");
            activeKey = fallbackKey;
            geoData = await getOwmGeoData({ city }, activeKey);
        }

        if (geoData) {
            lat = geoData.lat;
            lon = geoData.lon;
            city = geoData.name;
        } else {
            console.error(`Geocoding failed for city "${city}" with all keys. Falling back to mock data.`);
            const airDataForMock = await getApiNinjasAirQuality(city);
            return getMockWeatherData(51.5072, -0.1276, city, airDataForMock);
        }
    } else {
        lat = location.lat;
        lon = location.lon;
        activeKey = primaryKey; // Start with primary key for reverse geo
        try {
            const reverseGeoUrl = new URL('https://api.openweathermap.org/geo/1.0/reverse');
            reverseGeoUrl.searchParams.set('lat', lat.toString());
            reverseGeoUrl.searchParams.set('lon', lon.toString());
            reverseGeoUrl.searchParams.set('limit', '1');
            const reverseGeoData = await fetchOwmData(reverseGeoUrl, activeKey);
            if (reverseGeoData.length > 0) {
                city = reverseGeoData[0].name;
            }
        } catch (e) {
            console.warn("Reverse geocoding failed with primary key, trying fallback.", (e as Error).message);
            activeKey = fallbackKey;
             try {
                const reverseGeoUrl = new URL('https://api.openweathermap.org/geo/1.0/reverse');
                reverseGeoUrl.searchParams.set('lat', lat.toString());
                reverseGeoUrl.searchParams.set('lon', lon.toString());
                reverseGeoUrl.searchParams.set('limit', '1');
                const reverseGeoData = await fetchOwmData(reverseGeoUrl, activeKey);
                if (reverseGeoData.length > 0) {
                    city = reverseGeoData[0].name;
                }
             } catch(e2) {
                console.warn("Reverse geocoding failed with fallback key.", (e2 as Error).message);
             }
        }
    }

    const airData = city ? await getApiNinjasAirQuality(city) : null;
    
    const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    weatherUrl.searchParams.set('lat', lat.toString());
    weatherUrl.searchParams.set('lon', lon.toString());
    weatherUrl.searchParams.set('units', 'metric');
    
    const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
    forecastUrl.searchParams.set('lat', lat.toString());
    forecastUrl.searchParams.set('lon', lon.toString());
    forecastUrl.searchParams.set('units', 'metric');

    try {
        let weatherData, forecastData;
        try {
            activeKey = primaryKey;
            console.log(`Fetching OWM data with primary key for ${city || `lat/lon ${lat}/${lon}`}`);
            [weatherData, forecastData] = await Promise.all([
                fetchOwmData(weatherUrl, activeKey),
                fetchOwmData(forecastUrl, activeKey),
            ]);
        } catch (error) {
            console.warn(`Primary OWM key failed. Trying fallback. Error:`, (error as Error).message);
            activeKey = fallbackKey;
            console.log(`Fetching OWM data with fallback key for ${city || `lat/lon ${lat}/${lon}`}`);
            [weatherData, forecastData] = await Promise.all([
                fetchOwmData(weatherUrl, activeKey),
                fetchOwmData(forecastUrl, activeKey),
            ]);
        }
        
        return transformWeatherData(weatherData, forecastData, airData);

    } catch (error) {
        console.error("All OWM API attempts failed. Falling back to mock data.", (error as Error).message);
        return getMockWeatherData(lat, lon, city, airData);
    }
}
