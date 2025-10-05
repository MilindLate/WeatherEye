'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { getMockWeatherData, transformWeatherData, type WeatherData, type AirQuality } from '@/lib/weather-data';

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
            console.error(`API Ninjas request failed for ${city}: ${response.statusText}`);
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


export async function getRealtimeWeatherData(location: { lat: number, lon: number } | { city: string }): Promise<WeatherData | null> {
    const owmApiKey = process.env.OWM_API_KEY;
    if (!owmApiKey) {
      console.error('OpenWeatherMap API key is missing. Falling back to mock data.');
      if ('city' in location && location.city) {
         return getMockWeatherData(51.5072, -0.1276, location.city);
      }
      if('lat' in location && 'lon' in location) {
          return getMockWeatherData(location.lat, location.lon);
      }
      return getMockWeatherData(51.5072, -0.1276);
    }

    const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
    const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
    
    let lat: number, lon: number;
    let city: string | undefined;

    try {
      if ('city' in location) {
        city = location.city;
        const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
        geoUrl.searchParams.set('q', city);
        geoUrl.searchParams.set('limit', '1');
        geoUrl.searchParams.set('appid', owmApiKey);
        const geoResponse = await fetch(geoUrl.toString());
         if (!geoResponse.ok) {
            console.error(`Failed to geocode city ${city}: ${geoResponse.statusText}`);
            return getMockWeatherData(51.5072, -0.1276, city);
        }
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
            console.error(`Could not find location for city: ${city}`);
            return getMockWeatherData(51.5072, -0.1276, city);
        }
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        city = geoData[0].name; // Use the canonical name from the geocoding response
      } else {
        lat = location.lat;
        lon = location.lon;
        // Reverse geocode to get city name for API Ninjas
        const reverseGeoUrl = new URL('https://api.openweathermap.org/geo/1.0/reverse');
        reverseGeoUrl.searchParams.set('lat', lat.toString());
        reverseGeoUrl.searchParams.set('lon', lon.toString());
        reverseGeoUrl.searchParams.set('limit', '1');
        reverseGeoUrl.searchParams.set('appid', owmApiKey);
        const reverseGeoRes = await fetch(reverseGeoUrl.toString());
        if (reverseGeoRes.ok) {
            const reverseGeoData = await reverseGeoRes.json();
            if (reverseGeoData.length > 0) {
                city = reverseGeoData[0].name;
            }
        }
      }
      
      const commonParams = {
        appid: owmApiKey,
        units: 'metric',
      };

      weatherUrl.searchParams.set('lat', lat.toString());
      weatherUrl.searchParams.set('lon', lon.toString());
      weatherUrl.searchParams.set('appid', commonParams.appid);
      weatherUrl.searchParams.set('units', commonParams.units);
      
      forecastUrl.searchParams.set('lat', lat.toString());
      forecastUrl.searchParams.set('lon', lon.toString());
      forecastUrl.searchParams.set('appid', commonParams.appid);
      forecastUrl.searchParams.set('units', commonParams.units);

      let airData = null;
      if (city) {
          airData = await getApiNinjasAirQuality(city);
      }

      const [weatherRes, forecastRes] = await Promise.all([
          fetch(weatherUrl.toString()),
          fetch(forecastUrl.toString()),
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
          console.error('One or more OWM API requests failed. Falling back to mock data');
          return getMockWeatherData(lat, lon, city);
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      
      // If API Ninjas call failed or wasn't possible, create fallback AQI data.
      if (!airData) {
          console.warn("Could not fetch air quality from API-Ninjas. Creating fallback data.");
          const defaultPollutant = { concentration: 0, aqi: 0 };
          airData = {
            overall_aqi: 0,
            CO: defaultPollutant,
            NO2: defaultPollutant,
            O3: defaultPollutant,
            SO2: defaultPollutant,
            'PM2.5': defaultPollutant,
            PM10: defaultPollutant,
          }
      }

      return transformWeatherData(weatherData, forecastData, airData);

    } catch (error) {
        console.error("Error fetching real-time weather data:", error);
        return getMockWeatherData(51.5072, -0.1276, city);
    }
}
