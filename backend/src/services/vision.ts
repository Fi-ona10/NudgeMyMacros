import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyseImage(base64Image: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  // 🔑 Fallback mock — returns fake data if no key is set
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️  No Gemini API key — returning mock food items');
    return ['grilled chicken', 'brown rice', 'broccoli'];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      'List the food items visible in this image. Return only a JSON array of food item names, nothing else. Example: ["grilled chicken", "rice", "salad"]',
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const text = result.response.text().trim();

    // Strip markdown code blocks if Gemini wraps the response in ```json ... ```
    const cleaned = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleaned);
    return parsed;

  } catch (err) {
    console.error('❌ Gemini vision error:', err);
    // Graceful fallback so the app doesn't crash
    return ['unknown food'];
  }
}

