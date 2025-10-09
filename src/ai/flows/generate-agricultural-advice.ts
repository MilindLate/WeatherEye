'use server';

/**
 * @fileOverview An agricultural advice AI agent.
 *
 * - generateAgriculturalAdvice - A function that provides crop recommendations based on weather and location.
 * - GenerateAgriculturalAdviceInput - The input type for the function.
 * - GenerateAgriculturalAdviceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgriculturalAdviceInputSchema = z.object({
  locationName: z.string().describe('The name of the city or region for the forecast.'),
  temperatureHigh: z.number().describe('The high temperature for the day in Celsius.'),
  temperatureLow: z.number().describe('The low temperature for the day in Celsius.'),
  condition: z.string().describe('A general description of the weather conditions for the day (e.g., sunny, cloudy, rainy).'),
  precipitationProbability: z.number().describe('The probability of precipitation for the day (0-1).'),
});
export type GenerateAgriculturalAdviceInput = z.infer<typeof GenerateAgriculturalAdviceInputSchema>;

const CropAdviceSchema = z.object({
  cropName: z.string().describe('The name of the crop.'),
  reason: z.string().describe('A brief reason for the recommendation or warning.'),
});

const GenerateAgriculturalAdviceOutputSchema = z.object({
  recommendations: z.array(CropAdviceSchema).describe('A list of crops that are suitable for growing in the current conditions.'),
  warnings: z.array(CropAdviceSchema).describe('A list of crops that are not suitable for growing in the current conditions.'),
});
export type GenerateAgriculturalAdviceOutput = z.infer<typeof GenerateAgriculturalAdviceOutputSchema>;

export async function generateAgriculturalAdvice(input: GenerateAgriculturalAdviceInput): Promise<GenerateAgriculturalAdviceOutput> {
  return generateAgriculturalAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgriculturalAdvicePrompt',
  input: {schema: GenerateAgriculturalAdviceInputSchema},
  output: {schema: GenerateAgriculturalAdviceOutputSchema},
  prompt: `You are an agricultural expert providing advice to farmers.

  Given the following weather forecast for {{{locationName}}}, provide a list of 3 crop recommendations and 3 crop warnings suitable for that specific region.
  Focus on common vegetables, fruits, and grains that are relevant to the location.
  For each recommendation, briefly explain why the crop is a good choice for these conditions.
  For each warning, briefly explain why the crop should be avoided.

  Weather Data:
  - Location: {{{locationName}}}
  - Temperature High: {{{temperatureHigh}}}°C
  - Temperature Low: {{{temperatureLow}}}°C
  - Condition: {{{condition}}}
  - Precipitation Probability: {{{precipitationProbability}}}

  You must provide your response in the requested JSON format. Do not output anything other than the JSON object.`,
});

const generateAgriculturalAdviceFlow = ai.defineFlow(
  {
    name: 'generateAgriculturalAdviceFlow',
    inputSchema: GenerateAgriculturalAdviceInputSchema,
    outputSchema: GenerateAgriculturalAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
