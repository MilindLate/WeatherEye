
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
            console.error(`API Ninjas request failed for ${city}: ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        
        if (data.error) {
             console.error(`API Ninjas returned an error for ${city}: ${data.error}`);
             return null;
        }
        
        // Ensure all expected fields are present, providing defaults if they are not.
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

    let lat: number, lon: number;
    let city: string | undefined;
    let airData: AirQuality | null = null;

    try {
      if ('city' in location) {
        city = location.city;
        const geoUrl = new URL('https://api.openweathermap.org/geo/1.0/direct');
        geoUrl.searchParams.set('q', city);
        geoUrl.searchParams.set('limit', '1');
        geoUrl.searchParams.set('appid', owmApiKey);
        
        const geoResponse = await fetch(geoUrl.toString());
         if (!geoResponse.ok) {
            const errorText = await geoResponse.text();
            console.error(`Failed to geocode city ${city}: ${geoResponse.statusText}`, errorText);
            if (city) airData = await getApiNinjasAirQuality(city);
            return getMockWeatherData(51.5072, -0.1276, city, airData);
        }
        const geoData = await geoResponse.json();
        if (!geoData || geoData.length === 0) {
            console.error(`Could not find location for city: ${city}`);
            if (city) airData = await getApiNinjasAirQuality(city);
            return getMockWeatherData(51.5072, -0.1276, city, airData);
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
      
      if (city) {
          airData = await getApiNinjasAirQuality(city);
      }
      
      const weatherUrl = new URL('https://api.openweathermap.org/data/2.5/weather');
      weatherUrl.searchParams.set('lat', lat.toString());
      weatherUrl.searchParams.set('lon', lon.toString());
      weatherUrl.searchParams.set('appid', owmApiKey);
      weatherUrl.searchParams.set('units', 'metric');
      
      const forecastUrl = new URL('https://api.openweathermap.org/data/2.5/forecast');
      forecastUrl.searchParams.set('lat', lat.toString());
      forecastUrl.searchParams.set('lon', lon.toString());
      forecastUrl.searchParams.set('appid', owmApiKey);
      forecastUrl.searchParams.set('units', 'metric');


      const [weatherRes, forecastRes] = await Promise.all([
          fetch(weatherUrl.toString()),
          fetch(forecastUrl.toString()),
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
          const weatherError = !weatherRes.ok ? await weatherRes.text() : '';
          const forecastError = !forecastRes.ok ? await forecastRes.text() : '';
          console.error(`One or more OWM API requests failed.`, { weatherStatus: weatherRes.status, forecastStatus: forecastRes.status, weatherError, forecastError });
          return getMockWeatherData(lat, lon, city, airData);
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      
      // If API Ninjas call failed or wasn't possible, create fallback AQI data.
      if (!airData) {
          console.warn("Could not fetch air quality from API-Ninjas. Using fallback data.");
          airData = getMockWeatherData(lat, lon, city).current.airQuality;
      }

      return transformWeatherData(weatherData, forecastData, airData);

    } catch (error) {
        console.error("Error fetching real-time weather data:", error);
        return getMockWeatherData(51.5072, -0.1276, city, airData);
    }
}
