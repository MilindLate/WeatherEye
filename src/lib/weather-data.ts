import { format } from 'date-fns';

export type WeatherCondition =
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
  condition: WeatherCondition;
  humidity: number;
  wind: number;
  airQuality: AirQuality;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  precipitation: number;
  condition: WeatherCondition;
}

export interface DailyForecast {
  day: string;
  temp: { min: number; max: number };
  condition: WeatherCondition;
  precipitation: number;
  wind: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

const conditions: WeatherCondition[] = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Rainy',
  'Heavy Rain',
  'Thunderstorm',
  'Snow',
  'Fog',
  'Windy',
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number, decimals: number): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}


export const getMockWeatherData = (lat: number, lon: number): WeatherData => {
  const now = new Date();
  
  const currentCondition = getRandomElement(conditions);

  const current: CurrentWeather = {
    locationName: `City (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    temp: getRandomInt(-5, 35),
    condition: currentCondition,
    humidity: getRandomInt(30, 90),
    wind: getRandomInt(0, 30),
    airQuality: {
        aqi: getRandomInt(10, 200),
        pm25: getRandomFloat(5, 50, 1),
        pm10: getRandomFloat(10, 100, 1),
        so2: getRandomFloat(1, 20, 1),
        no2: getRandomFloat(5, 40, 1),
        o3: getRandomFloat(20, 100, 1),
        co: getRandomFloat(0.1, 2, 1),
    }
  };

  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now);
    hour.setHours(now.getHours() + i);
    return {
      time: format(hour, 'HH:00'),
      temp: current.temp + Math.round(Math.sin((i / 24) * Math.PI * 2) * 5) + getRandomInt(-1, 1),
      precipitation: ['Rainy', 'Heavy Rain', 'Thunderstorm', 'Snow'].includes(getRandomElement(conditions)) ? Math.random() : 0,
      condition: getRandomElement(conditions),
    };
  });

  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const dayCondition = getRandomElement(conditions);
    const maxTemp = current.temp + getRandomInt(2, 6);
    const minTemp = maxTemp - getRandomInt(5, 10);
    return {
      day: i === 0 ? 'Today' : format(day, 'EEE'),
      temp: { min: minTemp, max: maxTemp },
      condition: dayCondition,
      precipitation: ['Rainy', 'Heavy Rain', 'Thunderstorm', 'Snow'].includes(dayCondition) ? parseFloat(Math.random().toFixed(2)) : 0,
      wind: getRandomInt(5, 40),
    };
  });

  return { current, hourly, daily };
};
