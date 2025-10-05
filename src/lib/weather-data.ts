import { format, fromUnixTime, addHours, addDays } from 'date-fns';
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

export interface AirQuality {
    aqi: number;
    pm25: number;
    pm10: number;
    so2: number;
    no2: number;
    o3: number;
    co: number;
}

export interface CurrentWeather {
  locationName: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
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
    const zonedDate = toZonedTime(date, 'Etc/UTC');
    zonedDate.setSeconds(zonedDate.getSeconds() + timezoneOffset);
    return format(zonedDate, 'HH:00', { timeZone: 'Etc/UTC' });
};


export const transformWeatherData = (weather: any, forecast: any, air: any): WeatherData => {
    const timezoneOffset = weather.timezone;

    const current: CurrentWeather = {
        locationName: weather.name,
        temp: Math.round(weather.main.temp),
        feelsLike: Math.round(weather.main.feels_like),
        tempMin: Math.round(weather.main.temp_min),
        tempMax: Math.round(weather.main.temp_max),
        pressure: weather.main.pressure,
        condition: weather.weather[0] ? weather.weather[0].description : 'Clear',
        icon: weather.weather[0] ? mapOwmIconToIconType(weather.weather[0].icon) : 'Sunny',
        humidity: weather.main.humidity,
        wind: Math.round(weather.wind.speed * 3.6), // m/s to km/h
        airQuality: {
            aqi: air.list[0].aqi,
            pm25: air.list[0].pm25,
            pm10: air.list[0].pm10,
            so2: air.list[0].so2,
            no2: air.list[0].no2,
            o3: air.list[0].o3,
            co: air.list[0].co,
        }
    };

    const hourly: HourlyForecast[] = forecast.list.slice(0, 8).map((item: any) => ({
        time: formatTimeForTimezone(item.dt, timezoneOffset),
        temp: Math.round(item.main.temp),
        precipitation: item.pop,
        condition: item.weather[0] ? item.weather[0].description : 'Clear',
        icon: item.weather[0] ? mapOwmIconToIconType(item.weather[0].icon) : 'Sunny',
    }));


    const dailyForecasts: { [key: string]: DailyForecast } = {};

    forecast.list.forEach((item: any) => {
        const localDate = fromUnixTime(item.dt + timezoneOffset);
        const day = format(localDate, 'EEE', { timeZone: 'Etc/UTC' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                day: day,
                temp: { min: item.main.temp, max: item.main.temp },
                condition: item.weather[0] ? item.weather[0].description : 'Clear',
                icon: item.weather[0] ? mapOwmIconToIconType(item.weather[0].icon) : 'Sunny',
                precipitation: item.pop,
                wind: item.wind.speed
            };
        } else {
            dailyForecasts[day].temp.min = Math.min(dailyForecasts[day].temp.min, item.main.temp);
            dailyForecasts[day].temp.max = Math.max(dailyForecasts[day].temp.max, item.main.temp);
            
            const itemDate = fromUnixTime(item.dt + timezoneOffset);
            if (format(itemDate, 'HH', { timeZone: 'Etc/UTC' }) === '12') {
                 dailyForecasts[day].condition = item.weather[0] ? item.weather[0].description : 'Clear';
                 dailyForecasts[day].icon = item.weather[0] ? mapOwmIconToIconType(item.weather[0].icon) : 'Sunny';
            }
            dailyForecasts[day].precipitation = Math.max(dailyForecasts[day].precipitation, item.pop);
            dailyForecasts[day].wind = Math.max(dailyForecasts[day].wind, item.wind.speed);
        }
    });

    const daily = Object.values(dailyForecasts).slice(0, 7);
    if (daily.length > 0) {
      const today = format(toZonedTime(new Date(), 'Etc/UTC'), 'EEE', { timeZone: 'Etc/UTC' });
      if (daily[0].day === today) {
          daily[0].day = "Today";
      }
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

export const getMockWeatherData = (lat: number, lon: number, city?: string): WeatherData => {
    const seed = Math.abs((lat + lon) * 1000);
    const now = new Date();

    const currentCondition = getRandom(weatherConditions, seed);
    const current: CurrentWeather = {
        locationName: city || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
        temp: Math.round(randomBetween(15, 25, seed)),
        feelsLike: Math.round(randomBetween(14, 26, seed + 9)),
        tempMin: Math.round(randomBetween(10, 15, seed + 10)),
        tempMax: Math.round(randomBetween(25, 30, seed + 11)),
        pressure: Math.round(randomBetween(1000, 1020, seed + 12)),
        condition: currentCondition.condition,
        icon: currentCondition.icon,
        humidity: Math.round(randomBetween(40, 80, seed)),
        wind: Math.round(randomBetween(5, 25, seed + 1)),
        airQuality: {
            aqi: Math.round(randomBetween(10, 150, seed + 2)),
            pm25: Number(randomBetween(5, 70, seed + 3).toFixed(2)),
            pm10: Number(randomBetween(10, 100, seed + 4).toFixed(2)),
            so2: Number(randomBetween(1, 20, seed + 5).toFixed(2)),
            no2: Number(randomBetween(5, 40, seed + 6).toFixed(2)),
            o3: Number(randomBetween(20, 100, seed + 7).toFixed(2)),
            co: Number(randomBetween(0.1, 2, seed + 8).toFixed(2)),
        }
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
