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
        console.error("AI summary generation failed:", error);
        return null;
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
            console.error(`API Ninjas request failed for ${city}: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        
        if (data.error) {
             console.error(`API Ninjas returned an error for ${city}: ${data.error}`);
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
    url.searchParams.set('appid', apiKey);
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`OWM API request failed: ${res.statusText}`);
    }
    return res.json();
}

async function getOwmGeoData(location: { city: string }, apiKey: string): Promise<{lat: number, lon: number, name: string} | null> {
    if (!apiKey) return null;
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
    const primaryKey = process.env.OWM_API_KEY;
    const fallbackKey = process.env.OWM_API_KEY_FALLBACK;
    
    let lat: number, lon: number;
    let city: string | undefined;
    
    let activeKey = primaryKey;

    if ('city' in location) {
        city = location.city;
        let geoData = await getOwmGeoData({ city }, primaryKey!);
        if (!geoData && fallbackKey) {
            console.warn("Primary geocoding key failed, trying fallback.");
            activeKey = fallbackKey;
            geoData = await getOwmGeoData({ city }, fallbackKey);
        }

        if (geoData) {
            lat = geoData.lat;
            lon = geoData.lon;
            city = geoData.name;
        } else {
            console.error(`Geocoding failed for city "${city}" with all keys. Falling back to mock data.`);
            return getMockWeatherData(51.5072, -0.1276, city);
        }
    } else {
        lat = location.lat;
        lon = location.lon;
        // Attempt to get city name for air quality, but don't fail if it doesn't work
        const reverseGeoUrl = new URL('https://api.openweathermap.org/geo/1.0/reverse');
        reverseGeoUrl.searchParams.set('lat', lat.toString());
        reverseGeoUrl.searchParams.set('lon', lon.toString());
        reverseGeoUrl.searchParams.set('limit', '1');
        try {
            const reverseGeoData = await fetchOwmData(reverseGeoUrl, activeKey!);
            if (reverseGeoData.length > 0) {
                city = reverseGeoData[0].name;
            }
        } catch (e) {
            console.warn("Reverse geocoding failed, will proceed without city name for AQI.");
        }
    }

    let airData: AirQuality | null = null;
    if (city) {
      airData = await getApiNinjasAirQuality(city);
    }
    
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
            [weatherData, forecastData] = await Promise.all([
                fetchOwmData(weatherUrl, activeKey!),
                fetchOwmData(forecastUrl, activeKey!),
            ]);
        } catch (error) {
            console.warn(`API calls with active key (${activeKey}) failed. Trying another key.`);
            const nextKey = activeKey === primaryKey ? fallbackKey : primaryKey;
            if (nextKey && nextKey !== activeKey) {
                 activeKey = nextKey;
                 [weatherData, forecastData] = await Promise.all([
                    fetchOwmData(weatherUrl, activeKey!),
                    fetchOwmData(forecastUrl, activeKey!),
                ]);
            } else {
                throw error; // Re-throw if no other key to try or keys are the same
            }
        }
        
        if (!airData) {
            console.warn("Could not fetch air quality. Using fallback AQI data for transform.");
            airData = getMockWeatherData(lat, lon, city).current.airQuality;
        }

        return transformWeatherData(weatherData, forecastData, airData);

    } catch (error) {
        console.error("All OWM API attempts failed. Falling back to mock data.", (error as Error).message);
        return getMockWeatherData(lat, lon, city, airData);
    }
}
