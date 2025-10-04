'use server';

/**
 * @fileOverview An AI agent that suggests weather alerts based on a forecast.
 *
 * - generateAlertSuggestions - A function that suggests alerts.
 * - GenerateAlertSuggestionsInput - The input type for the function.
 * - GenerateAlertSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlertSuggestionsInputSchema = z.object({
  forecast: z.array(z.string()).describe('A list of daily weather forecast strings.'),
});
export type GenerateAlertSuggestionsInput = z.infer<typeof GenerateAlertSuggestionsInputSchema>;

export const SuggestedAlertSchema = z.object({
    condition: z.enum(['temp_above', 'temp_below', 'wind_above', 'humidity_above']).describe("The type of condition to alert on."),
    value: z.number().describe("The threshold value for the alert."),
    label: z.string().describe("A human-readable label for the alert (e.g., 'Temp > 30°C')."),
    reason: z.string().describe("A brief, one-sentence explanation for why this alert is being suggested."),
});
export type SuggestedAlert = z.infer<typeof SuggestedAlertSchema>;


const GenerateAlertSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestedAlertSchema).describe('A list of 2-3 suggested weather alerts.'),
});
export type GenerateAlertSuggestionsOutput = z.infer<typeof GenerateAlertSuggestionsOutputSchema>;


export async function generateAlertSuggestions(input: GenerateAlertSuggestionsInput): Promise<GenerateAlertSuggestionsOutput> {
  return generateAlertSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertSuggestionsPrompt',
  input: {schema: GenerateAlertSuggestionsInputSchema},
  output: {schema: GenerateAlertSuggestionsOutputSchema},
  prompt: `You are a helpful assistant that suggests weather alerts.
  Analyze the following 7-day forecast and suggest 2 or 3 relevant alerts.
  Focus on significant deviations from normal weather, like upcoming heatwaves, cold snaps, or very windy days.

  - For temperature, suggest an alert if the max temperature goes above 32°C or below 5°C.
  - For wind, suggest an alert if the wind speed goes above 40 km/h.
  - Round the alert value to a reasonable integer. For example, if the high is 34, suggest an alert for "> 32°C", not "> 34°C".
  - The reason should be concise and reference the day and data point that justifies the suggestion.

  Forecast Data:
  {{#each forecast}}
  - {{{this}}}
  {{/each}}

  Provide your response in the requested JSON format.
  `,
});

const generateAlertSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateAlertSuggestionsFlow',
    inputSchema: GenerateAlertSuggestionsInputSchema,
    outputSchema: GenerateAlertSuggestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
