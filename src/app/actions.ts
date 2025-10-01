'use server'

import { generateDailyWeatherSummary, type GenerateDailyWeatherSummaryInput } from '@/ai/flows/generate-daily-weather-summary';

export async function getAiSummary(input: GenerateDailyWeatherSummaryInput): Promise<string> {
    try {
        const result = await generateDailyWeatherSummary(input);
        return result.summary;
    } catch (error) {
        console.error("AI summary generation failed:", error);
        return "Could not generate weather summary at this time.";
    }
}
