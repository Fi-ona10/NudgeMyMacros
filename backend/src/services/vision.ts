import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyseImage(base64Image: string): Promise<string[]> {
  console.log('🤖 Calling Gemini Vision...');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // ✅ read at call time
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Strip data URL prefix if present (e.g. "data:image/jpeg;base64,")
    const base64Data = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      },
      {
        text: `You are a nutrition assistant. Look at this food image and list ONLY the food items you can see.
Return ONLY a JSON array of food item names, nothing else.
Example: ["greek yoghurt", "granola", "blueberries", "honey"]
Be specific and accurate. Do not guess or use placeholder foods.`,
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();
    console.log('✅ Gemini raw response:', text);

    // Parse the JSON array from Gemini's response
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      console.error('❌ Could not parse Gemini response as array:', text);
      return ['unknown food'];
    }

    const foodItems: string[] = JSON.parse(jsonMatch[0]);
    console.log('🍽️ Food items detected:', foodItems);
    return foodItems;

  } catch (error) {
    console.error('❌ Gemini Vision error:', error);
    throw new Error('Failed to analyse image with Gemini');
  }
}
