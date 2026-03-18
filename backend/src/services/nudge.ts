import axios from 'axios';
import { MacroSummary } from './macros';

export async function generateNudge(macros: MacroSummary): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  // 🔑 Mock nudge when no real key yet
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn('⚠️  No real API key — returning mock nudge');
    return `Great meal! You had ${macros.totalCalories} kcal with ${macros.totalProtein}g protein. Keep it up! 💪`;
  }

  const prompt = `
    A user just ate a meal with these macros:
    - Calories: ${macros.totalCalories} kcal
    - Protein: ${macros.totalProtein}g
    - Carbs: ${macros.totalCarbs}g
    - Fat: ${macros.totalFat}g

    Write a short, friendly, motivational nutrition nudge (2-3 sentences max).
    Be encouraging and specific to their macros.
  `;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}
