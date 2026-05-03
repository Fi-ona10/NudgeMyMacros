import { GoogleGenerativeAI } from '@google/generative-ai';
import { MacroSummary } from './macros';

export async function generateNudge(macros: MacroSummary): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn(':warning: No real Gemini API key — returning mock nudge');
    return `Great meal! You had ${macros.totalCalories} kcal with ${macros.totalProtein}g protein. Keep it up!`;
  }

  const prompt = `
A user just ate a meal with these macros:
Calories: ${macros.totalCalories} kcal
Protein: ${macros.totalProtein}g
Carbs: ${macros.totalCarbs}g
Fat: ${macros.totalFat}g

Write a short, friendly, motivational nutrition nudge.
Use only 2-3 sentences.
Be encouraging and specific to their macros.
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey); // ✅ read at call time
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error(':x: Gemini Nudge error:', error);
    throw new Error('Failed to generate nudge with Gemini');
  }
}