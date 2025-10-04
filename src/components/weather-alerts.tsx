'use client';

import { useWeatherAlerts } from '@/hooks/use-weather-alerts';
import type { CurrentWeather, DailyForecast } from '@/lib/weather-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Bell, PlusCircle, Trash2, AlertTriangle, Thermometer, Wind, Droplets } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useState } from 'react';

const alertSchema = z.object({
  condition: z.enum(['temp_above', 'temp_below', 'wind_above', 'humidity_above']),
  value: z.coerce.number().min(-50, 'Value too low').max(100, 'Value too high'),
});

type AlertFormData = z.infer<typeof alertSchema>;

export default function WeatherAlerts({ currentData, dailyData }: { currentData: CurrentWeather | null, dailyData: DailyForecast[] | null }) {
  const { alerts, permission, requestPermission, addAlert, removeAlert } = useWeatherAlerts(currentData);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      condition: 'temp_above',
      value: 30,
    },
  });

  const onSubmit = (data: AlertFormData) => {
    addAlert(data.condition, data.value);
    form.reset();
    setDialogOpen(false);
  };
  
  const getIconForCondition = (condition: AlertFormData['condition']) => {
    switch (condition) {
        case 'temp_above':
        case 'temp_below':
            return <Thermometer className="h-4 w-4 mr-2" />;
        case 'wind_above':
            return <Wind className="h-4 w-4 mr-2" />;
        case 'humidity_above':
            return <Droplets className="h-4 w-4 mr-2" />;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary">
            <AlertTriangle />
            Custom Alerts
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Alert
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Set a new Weather Alert</DialogTitle>
                    <DialogDescription>Get notified when a specific weather condition is met.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a condition" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="temp_above">Temperature rises above</SelectItem>
                                <SelectItem value="temp_below">Temperature drops below</SelectItem>
                                <SelectItem value="wind_above">Wind speed is over</SelectItem>
                                <SelectItem value="humidity_above">Humidity is over</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <DialogFooter>
                        <Button type="submit">Save Alert</Button>
                        </DialogFooter>
                    </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {permission === 'default' && (
          <div className="flex flex-col items-center gap-4 p-4 text-center bg-muted/50 rounded-lg">
            <Bell size={32} className="text-accent" />
            <p>Enable notifications to receive weather alerts.</p>
            <Button onClick={requestPermission} variant="secondary">
              Enable Notifications
            </Button>
          </div>
        )}
        {permission === 'denied' && (
          <div className="flex flex-col items-center gap-4 p-4 text-center bg-destructive/10 text-destructive-foreground rounded-lg">
             <Bell size={32} className="text-destructive" />
            <p>Notifications are disabled. Please enable them in your browser settings to use alerts.</p>
          </div>
        )}
        
        {permission === 'granted' && (
             alerts.length > 0 ? (
                <div className="space-y-2">
                    <ul className="space-y-2">
                        {alerts.map(alert => (
                        <li key={alert.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <div className="flex items-center font-medium">
                            {getIconForCondition(alert.condition)}
                            {alert.label}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeAlert(alert.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-4">No active alerts. Add one to get started.</p>
            )
        )}

      </CardContent>
    </Card>
  );
}
