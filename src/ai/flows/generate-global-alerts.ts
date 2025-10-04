'use server';

/**
 * @fileOverview A global weather alert generation AI agent.
 *
 * - generateGlobalAlerts - A function that generates a list of current severe weather alerts from around the world.
 * - GlobalAlert - The type for a single alert object.
 * - GenerateGlobalAlertsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GlobalAlertSchema = z.object({
  id: z.string().describe('A unique identifier for the alert (e.g., a random string).'),
  city: z.string().describe('The major city affected by the alert.'),
  country: z.string().describe('The country where the city is located.'),
  type: z.enum(['Extreme Heat', 'Severe Thunderstorm', 'High Winds', 'Flooding', 'Wildfire', 'Tsunami Watch']).describe('The type of weather alert.'),
  summary: z.string().describe('A one or two-sentence summary of the alert, including key details like temperature, wind speed, or expected impact.'),
  severity: z.enum(['High', 'Severe', 'Critical']).describe('The severity level of the alert.'),
});
export type GlobalAlert = z.infer<typeof GlobalAlertSchema>;

const GenerateGlobalAlertsOutputSchema = z.object({
  alerts: z.array(GlobalAlertSchema).describe('An array of 4 to 6 current, diverse, and realistic-sounding severe weather alerts from various major cities around the world.'),
});
export type GenerateGlobalAlertsOutput = z.infer<typeof GenerateGlobalAlertsOutputSchema>;


export async function generateGlobalAlerts(): Promise<GenerateGlobalAlertsOutput> {
  return generateGlobalAlertsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateGlobalAlertsPrompt',
  output: {schema: GenerateGlobalAlertsOutputSchema},
  prompt: `You are a global weather monitoring AI. Your task is to generate a list of 4 to 6 current, diverse, and realistic-sounding severe weather alerts from various major cities around the world.

  Instructions:
  - Ensure the alerts are for different types of severe weather (e.g., heatwave, typhoon, flooding, wildfire).
  - Place the alerts in different countries and continents.
  - Make the summary concise but informative.
  - Assign a severity level of 'High', 'Severe', or 'Critical' to each alert.
  - Provide the response in the requested JSON format.
  `,
});

const generateGlobalAlertsFlow = ai.defineFlow(
  {
    name: 'generateGlobalAlertsFlow',
    outputSchema: GenerateGlobalAlertsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
