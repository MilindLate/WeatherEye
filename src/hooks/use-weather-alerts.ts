'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import type { CurrentWeather } from '@/lib/weather-data';

export interface WeatherAlert {
  id: string;
  condition: 'temp_above' | 'temp_below' | 'wind_above' | 'humidity_above';
  value: number;
  label: string;
}

const getConditionLabel = (condition: WeatherAlert['condition'], value: number) => {
    switch (condition) {
        case 'temp_above': return `Temp > ${value}°C`;
        case 'temp_below': return `Temp < ${value}°C`;
        case 'wind_above': return `Wind > ${value} km/h`;
        case 'humidity_above': return `Humidity > ${value}%`;
    }
}

export function useWeatherAlerts(currentData: CurrentWeather | null) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setPermission(Notification.permission);
        const savedAlerts = localStorage.getItem('weatherAlerts');
        if (savedAlerts) {
            setAlerts(JSON.parse(savedAlerts));
        }
    }
  }, []);

  const requestPermission = useCallback(() => {
    Notification.requestPermission().then((perm) => {
        setPermission(perm);
        if (perm === 'granted') {
            toast({ title: 'Notifications enabled!', description: 'You will now receive weather alerts.' });
        } else {
            toast({ title: 'Notifications denied', description: 'Please enable notifications in your browser settings to receive alerts.', variant: 'destructive' });
        }
    });
  }, [toast]);

  const addAlert = useCallback((condition: WeatherAlert['condition'], value: number) => {
    const newAlert: WeatherAlert = {
      id: new Date().toISOString(),
      condition,
      value,
      label: getConditionLabel(condition, value),
    };
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('weatherAlerts', JSON.stringify(updatedAlerts));
    toast({ title: 'Alert set!', description: newAlert.label });
  }, [alerts, toast]);

  const removeAlert = useCallback((id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('weatherAlerts', JSON.stringify(updatedAlerts));
    toast({ title: 'Alert removed' });
  }, [alerts, toast]);

  useEffect(() => {
    if (permission !== 'granted' || !currentData || alerts.length === 0) {
      return;
    }

    const checkAlerts = () => {
        alerts.forEach(alert => {
            let triggered = false;
            let body = '';
            
            if (alert.condition === 'temp_above' && currentData.temp > alert.value) {
                triggered = true;
                body = `Current temperature ${currentData.temp}°C is above your alert threshold of ${alert.value}°C.`;
            } else if (alert.condition === 'temp_below' && currentData.temp < alert.value) {
                triggered = true;
                body = `Current temperature ${currentData.temp}°C is below your alert threshold of ${alert.value}°C.`;
            } else if (alert.condition === 'wind_above' && currentData.wind > alert.value) {
                triggered = true;
                body = `Current wind speed ${currentData.wind} km/h is above your alert threshold of ${alert.value} km/h.`;
            } else if (alert.condition === 'humidity_above' && currentData.humidity > alert.value) {
                triggered = true;
                body = `Current humidity ${currentData.humidity}% is above your alert threshold of ${alert.value}%.`;
            }

            if (triggered) {
                new Notification('WeatherEye Alert', { body, icon: '/icon.png' });
                // To avoid spamming, we could add logic to only notify once per hour per alert
            }
        });
    };
    
    // Check alerts every 5 minutes
    const interval = setInterval(checkAlerts, 1000 * 60 * 5);
    return () => clearInterval(interval);

  }, [permission, currentData, alerts]);

  return { alerts, permission, requestPermission, addAlert, removeAlert };
}
