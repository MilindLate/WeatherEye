import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-weather-summary.ts';
import '@/ai/flows/generate-agricultural-advice.ts';
import '@/ai/flows/generate-global-alerts.ts';
