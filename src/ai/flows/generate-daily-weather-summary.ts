'use server';

/**
 * @fileOverview A weather condition summary AI agent.
 *
 * - generateDailyWeatherSummary - A function that generates a concise summary of the daily weather forecast.
 * - GenerateDailyWeatherSummaryInput - The input type for the generateDailyWeatherSummary function.
 * - GenerateDailyWeatherSummaryOutput - The return type for the generateDailyWeatherSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyWeatherSummaryInputSchema = z.object({
  temperatureHigh: z.number().describe('The high temperature for the day in Celsius.'),
  temperatureLow: z.number().describe('The low temperature for the day in Celsius.'),
  condition: z.string().describe('A general description of the weather conditions for the day (e.g., sunny, cloudy, rainy).'),
  precipitationProbability: z.number().describe('The probability of precipitation for the day (0-1).'),
  windSpeed: z.number().describe('The wind speed for the day in km/h.'),
  airQualityIndex: z.number().describe('The Air Quality Index (AQI) for the day.'),
});
export type GenerateDailyWeatherSummaryInput = z.infer<typeof GenerateDailyWeatherSummaryInputSchema>;

const GenerateDailyWeatherSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the daily weather forecast, highlighting key factors like the need for an umbrella or potential hazards.'),
});
export type GenerateDailyWeatherSummaryOutput = z.infer<typeof GenerateDailyWeatherSummaryOutputSchema>;

export async function generateDailyWeatherSummary(input: GenerateDailyWeatherSummaryInput): Promise<GenerateDailyWeatherSummaryOutput> {
  return generateDailyWeatherSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyWeatherSummaryPrompt',
  input: {schema: GenerateDailyWeatherSummaryInputSchema},
  output: {schema: GenerateDailyWeatherSummaryOutputSchema},
  prompt: `You are a helpful assistant that summarizes weather forecasts.

  Given the following weather data, generate a concise summary of the daily weather forecast and air quality. The summary should be no more than three sentences.
  
  - Start with the weather, mentioning temperature, conditions, and if an umbrella is needed.
  - Then, comment on the air quality based on the AQI. An AQI of 0-50 is good, 51-100 is moderate, and above 100 is unhealthy.

  Temperature High: {{{temperatureHigh}}}°C
  Temperature Low: {{{temperatureLow}}}°C
  Condition: {{{condition}}}
  Precipitation Probability: {{{precipitationProbability}}}
  Wind Speed: {{{windSpeed}}} km/h
  Air Quality Index: {{{airQualityIndex}}}`,
});

const generateDailyWeatherSummaryFlow = ai.defineFlow(
  {
    name: 'generateDailyWeatherSummaryFlow',
    inputSchema: GenerateDailyWeatherSummaryInputSchema,
    outputSchema: GenerateDailyWeatherSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
