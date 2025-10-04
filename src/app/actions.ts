'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';
import { generateAgriculturalAdvice, type GenerateAgriculturalAdviceInput, type GenerateAgriculturalAdviceOutput } from '@/ai/flows/generate-agricultural-advice';
import { generateGlobalAlerts, type GenerateGlobalAlertsOutput } from '@/ai/flows/generate-global-alerts';
import { getMockWeatherData, transformWeatherData, type WeatherData } from '@/lib/weather-data';

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
    const apiKey = process.env.OWM_API_KEY;
    if (!apiKey) {
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
    const airPollutionUrl = new URL('https://api.openweathermap.org/data/2.5/air_pollution');
    
    let lat: number, lon: number;

    try {
      if ('city' in location) {
        weatherUrl.searchParams.set('q', location.city);
        weatherUrl.searchParams.set('appid', apiKey);
        weatherUrl.searchParams.set('units', 'metric');

        const weatherResponse = await fetch(weatherUrl.toString());
        if (!weatherResponse.ok) {
            console.error(`Failed to fetch weather for city ${location.city}: ${weatherResponse.statusText}`);
            return null;
        }
        const weatherData = await weatherResponse.json();
        lat = weatherData.coord.lat;
        lon = weatherData.coord.lon;
      } else {
        lat = location.lat;
        lon = location.lon;
      }
      
      const commonParams = {
        lat: lat.toString(),
        lon: lon.toString(),
        appid: apiKey,
        units: 'metric',
      };

      weatherUrl.searchParams.set('lat', commonParams.lat);
      weatherUrl.searchParams.set('lon', commonParams.lon);
      weatherUrl.searchParams.set('appid', commonParams.appid);
      weatherUrl.searchParams.set('units', commonParams.units);
      if(weatherUrl.searchParams.has('q')) {
        weatherUrl.searchParams.delete('q');
      }

      forecastUrl.searchParams.set('lat', commonParams.lat);
      forecastUrl.searchParams.set('lon', commonParams.lon);
      forecastUrl.searchParams.set('appid', commonParams.appid);
      forecastUrl.searchParams.set('units', commonParams.units);

      airPollutionUrl.searchParams.set('lat', commonParams.lat);
      airPollutionUrl.searchParams.set('lon', commonParams.lon);
      airPollutionUrl.searchParams.set('appid', commonParams.appid);

      const [weatherRes, forecastRes, airRes] = await Promise.all([
          fetch(weatherUrl.toString()),
          fetch(forecastUrl.toString()),
          fetch(airPollutionUrl.toString()),
      ]);

      if (!weatherRes.ok || !forecastRes.ok || !airRes.ok) {
          console.error('One or more API requests failed.');
          return null;
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      const airData = await airRes.json();

      return transformWeatherData(weatherData, forecastData, airData);

    } catch (error) {
        console.error("Error fetching real-time weather data:", error);
        return null;
    }
}
