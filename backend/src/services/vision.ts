import axios from 'axios';

export async function analyseImage(base64Image: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  // 🔑 Key placeholder — will work once real key is added
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn('⚠️  No real API key — returning mock food items');
    return ['grilled chicken', 'brown rice', 'broccoli'];
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'List the food items visible in this image. Return only a JSON array of food item names, nothing else. Example: ["grilled chicken", "rice", "salad"]',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed;
}
