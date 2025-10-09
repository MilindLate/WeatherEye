import { format, fromUnixTime, addHours, addDays, startOfDay, addSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export type WeatherIconType =
  | 'Sunny'
  | 'Partly Cloudy'
  | 'Cloudy'
  | 'Rainy'
  | 'Heavy Rain'
  | 'Thunderstorm'
  | 'Snow'
  | 'Fog'
  | 'Windy';

export interface PollutantData {
    concentration: number;
    aqi: number;
}

export interface AirQuality {
    overall_aqi: number;
    CO: PollutantData;
    NO2: PollutantData;
    O3: PollutantData;
    SO2: PollutantData;
    'PM2.5': PollutantData;
    PM10: PollutantData;
}

export interface CurrentWeather {
  locationName: string;
  temp: number;
  feelsLike: number;
  pressure: number;
  condition: string;
  icon: WeatherIconType;
  humidity: number;
  wind: number;
  airQuality: AirQuality | null;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  precipitation: number;
  condition: string;
  icon: WeatherIconType;
}

export interface DailyForecast {
  day: string;
  temp: { min: number; max: number };
  condition: string;
  icon: WeatherIconType;
  precipitation: number;
  wind: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

const mapWeatherstackIconToIconType = (iconUrl: string): WeatherIconType => {
  if (iconUrl.includes('wsymbol_0001_sunny')) return 'Sunny';
  if (iconUrl.includes('wsymbol_0002_sunny_intervals')) return 'Partly Cloudy';
  if (iconUrl.includes('wsymbol_0003_white_cloud')) return 'Cloudy';
  if (iconUrl.includes('wsymbol_0004_black_low_cloud')) return 'Cloudy';
  if (iconUrl.includes('wsymbol_0006_mist') || iconUrl.includes('wsymbol_0007_fog')) return 'Fog';
  if (iconUrl.includes('wsymbol_0009_light_rain_showers') || iconUrl.includes('wsymbol_0017_cloudy_with_light_rain')) return 'Rainy';
  if (iconUrl.includes('wsymbol_0010_heavy_rain_showers') || iconUrl.includes('wsymbol_0018_cloudy_with_heavy_rain')) return 'Heavy Rain';
  if (iconUrl.includes('wsymbol_0012_light_snow_showers') || iconUrl.includes('wsymbol_0020_cloudy_with_light_snow')) return 'Snow';
  if (iconUrl.includes('wsymbol_0016_thundery_showers') || iconUrl.includes('wsymbol_0024_thunderstorms')) return 'Thunderstorm';
  return 'Sunny';
};

export const transformWeatherData = (weatherstackData: any, air: AirQuality | null): WeatherData => {
    const { location, current: currentData } = weatherstackData;
    const now = new Date();

    const current: CurrentWeather = {
        locationName: location.name,
        temp: currentData.temperature,
        feelsLike: currentData.feelslike,
        pressure: currentData.pressure,
        condition: currentData.weather_descriptions[0] || 'Clear',
        icon: mapWeatherstackIconToIconType(currentData.weather_icons[0]),
        humidity: currentData.humidity,
        wind: currentData.wind_speed,
        airQuality: air
    };

    // Weatherstack's free plan does not provide hourly or daily forecast data.
    // We will generate mock data for these sections to keep the UI functional.
    const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
        const hourSeed = (location.lat + location.lon) * 1000 + i;
        const temp = current.temp - Math.sin(i / 4) * 4 + (Math.random() - 0.5) * 2;
        return {
            time: format(addHours(now, i), 'HH:00'),
            temp: Math.round(temp),
            precipitation: Math.random() > 0.8 ? Math.random() * 0.5 : 0, // Mock precipitation
            condition: current.condition,
            icon: current.icon,
        };
    });

    const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
        const daySeed = (location.lat + location.lon) * 1000 + 100 + i;
        const minTemp = current.temp + (Math.random() - 0.5) * 5 - (i * 0.5);
        const maxTemp = minTemp + Math.random() * 5 + 3;
        return {
            day: i === 0 ? 'Today' : format(addDays(now, i), 'EEE'),
            temp: { min: Math.round(minTemp), max: Math.round(maxTemp) },
            condition: current.condition,
            icon: current.icon,
            precipitation: Math.random() > 0.7 ? Math.random() : 0, // Mock precipitation
            wind: current.wind + (Math.random() - 0.5) * 10,
        };
    });
     // Ensure Today's forecast uses current data more accurately
    daily[0] = {
        day: 'Today',
        temp: {
            min: Math.round(current.temp - (Math.random() * 3)),
            max: Math.round(current.temp + (Math.random() * 3)),
        },
        condition: current.condition,
        icon: current.icon,
        precipitation: hourly[0]?.precipitation || 0,
        wind: current.wind,
    }


    return { current, hourly, daily };
};

// Mock data generation
const weatherConditions: {condition: string, icon: WeatherIconType}[] = [
    { condition: 'Sunny', icon: 'Sunny' },
    { condition: 'Partly Cloudy', icon: 'Partly Cloudy' },
    { condition: 'Cloudy', icon: 'Cloudy' },
    { condition: 'Light Rain', icon: 'Rainy' },
    { condition: 'Heavy Rain', icon: 'Heavy Rain' },
    { condition: 'Thunderstorm', icon: 'Thunderstorm' },
    { condition: 'Light Snow', icon: 'Snow' },
];

const getRandom = (arr: any[], seed: number) => arr[Math.floor(seed) % arr.length];
const randomBetween = (min: number, max: number, seed: number) => Math.random() * (max-min) + min;

export const getMockWeatherData = (lat: number, lon: number, city?: string, airQualityData?: AirQuality | null): WeatherData => {
    const seed = Math.abs((lat + lon) * 1000);
    const now = new Date();

    const currentCondition = getRandom(weatherConditions, seed);
    
    // Use provided air quality data if available, otherwise generate mock data
    let airQuality: AirQuality | null = airQualityData || null;

    if (!airQuality) {
        const defaultPollutant = { concentration: 0, aqi: 0 };
        airQuality = {
            overall_aqi: Math.round(randomBetween(10, 150, seed + 2)),
            CO: { concentration: Number(randomBetween(0.1, 2, seed + 8).toFixed(2)), aqi: Math.round(randomBetween(0, 5, seed + 13)) },
            NO2: { concentration: Number(randomBetween(5, 40, seed + 6).toFixed(2)), aqi: Math.round(randomBetween(0, 10, seed + 14)) },
            O3: { concentration: Number(randomBetween(20, 100, seed + 7).toFixed(2)), aqi: Math.round(randomBetween(20, 80, seed + 15)) },
            SO2: { concentration: Number(randomBetween(1, 20, seed + 5).toFixed(2)), aqi: Math.round(randomBetween(0, 5, seed + 16)) },
            'PM2.5': { concentration: Number(randomBetween(5, 70, seed + 3).toFixed(2)), aqi: Math.round(randomBetween(10, 80, seed + 17)) },
            PM10: { concentration: Number(randomBetween(10, 100, seed + 4).toFixed(2)), aqi: Math.round(randomBetween(10, 80, seed + 18)) }
        };
    }


    const current: CurrentWeather = {
        locationName: city || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
        temp: Math.round(randomBetween(15, 25, seed)),
        feelsLike: Math.round(randomBetween(14, 26, seed + 9)),
        pressure: Math.round(randomBetween(1000, 1020, seed + 12)),
        condition: currentCondition.condition,
        icon: currentCondition.icon,
        humidity: Math.round(randomBetween(40, 80, seed)),
        wind: Math.round(randomBetween(5, 25, seed + 1)),
        airQuality
    };

    const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
        const hourSeed = seed + 10 + i;
        const hourlyCondition = getRandom(weatherConditions, hourSeed);
        return {
            time: format(addHours(now, i), 'HH:00'),
            temp: Math.round(current.temp - Math.sin(i / 3) * 3 + randomBetween(-1, 1, hourSeed)),
            precipitation: Math.max(0, Math.min(1, randomBetween(-0.2, 0.5, hourSeed + 1))),
            condition: hourlyCondition.condition,
            icon: hourlyCondition.icon,
        };
    });

    const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
        const daySeed = seed + 100 + i;
        const dayCondition = getRandom(weatherConditions, daySeed);
        const minTemp = Math.round(current.temp + randomBetween(-5, 0, daySeed) - (i * 0.5));
        const maxTemp = Math.round(minTemp + randomBetween(5, 10, daySeed + 1));
        return {
            day: i === 0 ? 'Today' : format(addDays(now, i), 'EEE'),
            temp: { min: minTemp, max: maxTemp },
            condition: dayCondition.condition,
            icon: dayCondition.icon,
            precipitation: Math.max(0, Math.min(1, randomBetween(-0.1, 0.6, daySeed + 2))),
            wind: Math.round(randomBetween(5, 30, daySeed + 3)),
        };
    });

    return { current, hourly, daily };
};
