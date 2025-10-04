import { format, fromUnixTime } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// This is now used only for icon mapping.
// The actual condition text will come directly from the API.
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
  condition: string; // Will hold the raw description e.g., "broken clouds"
  icon: WeatherIconType; // Will hold the mapped icon type
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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper to convert UTC seconds to a formatted time string in a given timezone
// The `timezone` is the shift in seconds from UTC.
const formatTimeForTimezone = (utcSeconds: number, timezoneOffset: number): string => {
    const date = fromUnixTime(utcSeconds);
    const zonedDate = toZonedTime(date, 'Etc/UTC'); // Treat the date as UTC first
    zonedDate.setSeconds(zonedDate.getSeconds() + timezoneOffset); // Apply the offset
    return format(zonedDate, 'HH:00', { timeZone: 'Etc/UTC' });
};


export const transformWeatherData = (weather: any, forecast: any, air: any): WeatherData => {
    const timezoneOffset = weather.timezone;

    const current: CurrentWeather = {
        locationName: weather.name,
        temp: Math.round(weather.main.temp),
        condition: weather.weather[0] ? capitalize(weather.weather[0].description) : 'Clear',
        icon: weather.weather[0] ? mapOwmIconToIconType(weather.weather[0].icon) : 'Sunny',
        humidity: weather.main.humidity,
        wind: Math.round(weather.wind.speed * 3.6), // m/s to km/h
        airQuality: {
            aqi: air.list[0].main.aqi,
            pm25: air.list[0].components.pm2_5,
            pm10: air.list[0].components.pm10,
            so2: air.list[0].components.so2,
            no2: air.list[0].components.no2,
            o3: air.list[0].components.o3,
            co: air.list[0].components.co,
        }
    };

    const hourly: HourlyForecast[] = forecast.list.slice(0, 8).map((item: any) => ({
        time: formatTimeForTimezone(item.dt, timezoneOffset),
        temp: Math.round(item.main.temp),
        precipitation: item.pop,
        condition: item.weather[0] ? capitalize(item.weather[0].description) : 'Clear',
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
                condition: item.weather[0] ? capitalize(item.weather[0].description) : 'Clear',
                icon: item.weather[0] ? mapOwmIconToIconType(item.weather[0].icon) : 'Sunny',
                precipitation: item.pop,
                wind: item.wind.speed
            };
        } else {
            dailyForecasts[day].temp.min = Math.min(dailyForecasts[day].temp.min, item.main.temp);
            dailyForecasts[day].temp.max = Math.max(dailyForecasts[day].temp.max, item.main.temp);
            
            // For daily forecast, we can still use the noon-time weather as representative
            const itemDate = fromUnixTime(item.dt + timezoneOffset);
            if (format(itemDate, 'HH', { timeZone: 'Etc/UTC' }) === '12') {
                 dailyForecasts[day].condition = item.weather[0] ? capitalize(item.weather[0].description) : 'Clear';
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
