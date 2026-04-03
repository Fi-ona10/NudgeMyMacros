import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyseImage(base64Image: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 Gemini key loaded:', apiKey ? `YES (${apiKey.slice(0, 8)}...)` : 'NO');

  // 🔑 Fallback mock — returns fake data if no key is set
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️  No Gemini API key — returning mock food items');
    return ['grilled chicken', 'brown rice', 'broccoli'];
  }

  // ✅ Created INSIDE the function so dotenv has already loaded
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });


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
    return ['unknown food'];
  }
}
