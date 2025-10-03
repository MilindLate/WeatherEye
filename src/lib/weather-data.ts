import { format, fromUnixTime } from 'date-fns';

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

// OWM returns a code, we map it to our WeatherCondition
const mapOwmIconToCondition = (icon: string): WeatherCondition => {
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


export const transformWeatherData = (weather: any, forecast: any, air: any): WeatherData => {
    const current: CurrentWeather = {
        locationName: weather.name,
        temp: Math.round(weather.main.temp),
        condition: weather.weather[0] ? mapOwmIconToCondition(weather.weather[0].icon) : 'Sunny',
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
        time: format(fromUnixTime(item.dt), 'HH:00'),
        temp: Math.round(item.main.temp),
        precipitation: item.pop * 100,
        condition: item.weather[0] ? mapOwmIconToCondition(item.weather[0].icon) : 'Sunny',
    }));


    const dailyForecasts: { [key: string]: DailyForecast } = {};

    forecast.list.forEach((item: any) => {
        const day = format(fromUnixTime(item.dt), 'EEE');
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                day: day,
                temp: { min: item.main.temp, max: item.main.temp },
                condition: item.weather[0] ? mapOwmIconToCondition(item.weather[0].icon) : 'Sunny',
                precipitation: item.pop,
                wind: item.wind.speed
            };
        } else {
            dailyForecasts[day].temp.min = Math.min(dailyForecasts[day].temp.min, item.main.temp);
            dailyForecasts[day].temp.max = Math.max(dailyForecasts[day].temp.max, item.main.temp);
            if (item.dt_txt.includes("12:00:00")) {
                 dailyForecasts[day].condition = item.weather[0] ? mapOwmIconToCondition(item.weather[0].icon) : 'Sunny';
            }
            dailyForecasts[day].precipitation = Math.max(dailyForecasts[day].precipitation, item.pop);
            dailyForecasts[day].wind = Math.max(dailyForecasts[day].wind, item.wind.speed);
        }
    });

    const daily = Object.values(dailyForecasts).slice(0, 7);
    daily[0].day = "Today";


    return { current, hourly, daily };
};

export const getMockWeatherData = (lat: number, lon: number): WeatherData => {
  const now = new Date();
  
  const conditions: WeatherCondition[] = [
    'Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Heavy Rain', 'Thunderstorm', 'Snow', 'Fog', 'Windy',
  ];
  const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
  const getRandomFloat = (min: number, max: number, decimals: number): number => {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
  }

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