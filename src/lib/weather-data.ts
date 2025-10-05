
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
  airQuality: AirQuality;
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

const mapOwmIconToIconType = (icon: string): WeatherIconType => {
  switch (icon.substring(0, 2)) {
    case '01': return 'Sunny';
    case '02': return 'Partly Cloudy';
    case '03':
    case '04': return 'Cloudy';
    case '09': return 'Rainy';
    case '10': return 'Heavy Rain';
    case '11': return 'Thunderstorm';
    case '13': return 'Snow';
    case '50': return 'Fog';
    default: return 'Sunny';
  }
};

const formatTimeForTimezone = (utcSeconds: number, timezoneOffset: number): string => {
    const date = fromUnixTime(utcSeconds);
    const zonedDate = addSeconds(date, timezoneOffset)
    return format(zonedDate, 'HH:00', { timeZone: 'Etc/UTC' });
};


export const transformWeatherData = (weather: any, forecast: any, air: AirQuality): WeatherData => {
    const timezoneOffset = weather.timezone;

    const current: CurrentWeather = {
        locationName: weather.name,
        temp: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        pressure: weather.main.pressure,
        condition: weather.weather[0] ? weather.weather[0].description : 'Clear',
        icon: weather.weather[0] ? mapOwmIconToIconType(weather.weather[0].icon) : 'Sunny',
        humidity: weather.main.humidity,
        wind: Math.round(weather.wind.speed * 3.6), // m/s to km/h
        airQuality: air
    };

    const hourly: HourlyForecast[] = forecast.list.slice(0, 24).map((item: any) => ({
        time: formatTimeForTimezone(item.dt, timezoneOffset),
        temp: Math.round(item.main.temp),
        precipitation: item.pop,
        condition: item.weather[0] ? item.weather[0].description : 'Clear',
        icon: item.weather[0] ? mapOwmIconToIconType(item.weather[0].icon) : 'Sunny',
    }));


    const dailyForecasts: { [key: string]: { temps: number[], pops: number[], winds: any[], conditions: any[] } } = {};
    const nowInTimezone = addSeconds(new Date(), timezoneOffset);
    
    forecast.list.forEach((item: any) => {
        const itemDate = addSeconds(fromUnixTime(item.dt), timezoneOffset);
        const dayKey = format(itemDate, 'yyyy-MM-dd', { timeZone: 'Etc/UTC' });

        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = { temps: [], pops: [], winds: [], conditions: [] };
        }
        dailyForecasts[dayKey].temps.push(item.main.temp);
        dailyForecasts[dayKey].pops.push(item.pop);
        dailyForecasts[dayKey].winds.push(item.wind.speed);
        
        // Store condition for midday (around 12:00-14:00) as representative
        const hour = parseInt(format(itemDate, 'H', { timeZone: 'Etc/UTC' }));
        if (hour >= 12 && hour <= 14) {
            dailyForecasts[dayKey].conditions.push({
                condition: item.weather[0].description,
                icon: mapOwmIconToIconType(item.weather[0].icon)
            });
        }
    });

    const daily: DailyForecast[] = Object.keys(dailyForecasts).map((dayKey, index) => {
        const dayData = dailyForecasts[dayKey];
        const dayDate = new Date(dayKey + 'T00:00:00Z');
        const todayDate = startOfDay(nowInTimezone);
        
        let dayLabel: string;
        if(format(dayDate, 'yyyy-MM-dd') === format(todayDate, 'yyyy-MM-dd')) {
            dayLabel = "Today";
        } else {
            dayLabel = format(dayDate, 'EEE');
        }

        const representativeCondition = dayData.conditions[0] || { condition: 'Clear', icon: 'Sunny' };

        return {
            day: dayLabel,
            temp: {
                min: Math.min(...dayData.temps),
                max: Math.max(...dayData.temps)
            },
            condition: representativeCondition.condition,
            icon: representativeCondition.icon,
            precipitation: Math.max(...dayData.pops),
            wind: Math.max(...dayData.winds) * 3.6, // m/s to km/h
        };
    }).slice(0, 7);

    // Ensure 'Today' has current weather data if the forecast starts later.
    if (daily.length > 0 && daily[0].day !== 'Today') {
        const todayData: DailyForecast = {
            day: 'Today',
            temp: {
                min: weather.main.temp_min,
                max: weather.main.temp_max
            },
            condition: current.condition,
            icon: current.icon,
            precipitation: hourly[0]?.precipitation || 0,
            wind: current.wind,
        }
        daily.unshift(todayData);
    }
    
    return { current, hourly, daily: daily.slice(0, 7) };
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

export const getMockWeatherData = (lat: number, lon: number, city?: string): WeatherData => {
    const seed = Math.abs((lat + lon) * 1000);
    const now = new Date();

    const currentCondition = getRandom(weatherConditions, seed);
    
    const defaultPollutant = { concentration: 0, aqi: 0 };
    const airQuality: AirQuality = {
      overall_aqi: Math.round(randomBetween(10, 150, seed + 2)),
      CO: { concentration: Number(randomBetween(0.1, 2, seed + 8).toFixed(2)), aqi: Math.round(randomBetween(0, 5, seed + 13)) },
      NO2: { concentration: Number(randomBetween(5, 40, seed + 6).toFixed(2)), aqi: Math.round(randomBetween(0, 10, seed + 14)) },
      O3: { concentration: Number(randomBetween(20, 100, seed + 7).toFixed(2)), aqi: Math.round(randomBetween(20, 80, seed + 15)) },
      SO2: { concentration: Number(randomBetween(1, 20, seed + 5).toFixed(2)), aqi: Math.round(randomBetween(0, 5, seed + 16)) },
      'PM2.5': { concentration: Number(randomBetween(5, 70, seed + 3).toFixed(2)), aqi: Math.round(randomBetween(10, 80, seed + 17)) },
      PM10: { concentration: Number(randomBetween(10, 100, seed + 4).toFixed(2)), aqi: Math.round(randomBetween(10, 80, seed + 18)) }
    };

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
