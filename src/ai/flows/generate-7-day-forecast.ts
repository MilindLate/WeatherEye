'use server';

/**
 * @fileOverview A weather forecast generation AI agent.
 *
 * - generate7DayForecast - A function that generates a 7-day weather forecast using AI.
 * - Generate7DayForecastInput - The input type for the function.
 * - Generate7DayForecastOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeatherIconSchema = z.enum([
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Rainy',
  'Heavy Rain',
  'Thunderstorm',
  'Snow',
  'Fog',
  'Windy',
]);

const DailyForecastSchema = z.object({
  day: z.string().describe("The day of the week (e.g., 'Monday', 'Tuesday'). The first entry should be 'Today'."),
  temp: z.object({
    min: z.number().describe('The minimum forecasted temperature in Celsius.'),
    max: z.number().describe('The maximum forecasted temperature in Celsius.'),
  }),
  condition: z.string().describe('A brief, descriptive summary of the weather condition (e.g., "Sunny with scattered clouds", "Afternoon thunderstorms").'),
  icon: WeatherIconSchema,
  precipitation: z.number().min(0).max(1).describe('The probability of precipitation, from 0.0 to 1.0.'),
  wind: z.number().describe('The average wind speed in km/h.'),
});

export const Generate7DayForecastInputSchema = z.object({
  locationName: z.string().describe('The name of the location (e.g., city, region).'),
  currentTemp: z.number().describe('The current temperature in Celsius for context.'),
  currentCondition: z.string().describe('The current weather condition for context.'),
});
export type Generate7DayForecastInput = z.infer<typeof Generate7DayForecastInputSchema>;

export const Generate7DayForecastOutputSchema = z.object({
  forecast: z.array(DailyForecastSchema).length(7).describe('An array of 7 daily forecast objects.'),
});
export type Generate7DayForecastOutput = z.infer<typeof Generate7DayForecastOutputSchema>;

export async function generate7DayForecast(input: Generate7DayForecastInput): Promise<Generate7DayForecastOutput> {
  return generate7DayForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generate7DayForecastPrompt',
  input: { schema: Generate7DayForecastInputSchema },
  output: { schema: Generate7DayForecastOutputSchema },
  prompt: `You are a professional meteorologist. Based on the current weather conditions for a given location, generate a realistic and plausible 7-day weather forecast.

  Current Location: {{{locationName}}}
  Current Temperature: {{{currentTemp}}}°C
  Current Conditions: {{{currentCondition}}}

  Instructions:
  1.  Generate a forecast for the next 7 days, starting with "Today".
  2.  The weather should evolve realistically from day to day. Avoid drastic, unrealistic jumps in temperature or conditions.
  3.  Provide a brief, descriptive 'condition' for each day.
  4.  Select the most appropriate 'icon' from the available options for each day's condition.
  5.  Ensure the temperatures, precipitation probability, and wind speeds are reasonable for the given context and evolve naturally.
  6.  Return the forecast as a JSON object matching the specified output schema.
  `,
});

const generate7DayForecastFlow = ai.defineFlow(
  {
    name: 'generate7DayForecastFlow',
    inputSchema: Generate7DayForecastInputSchema,
    outputSchema: Generate7DayForecastOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
