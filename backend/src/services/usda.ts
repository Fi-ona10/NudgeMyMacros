import axios from 'axios';

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

export interface FoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function lookupNutrition(
  foodItems: string[]
): Promise<FoodNutrition[]> {
  const API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'; // ✅ read at call time
  console.log('🔑 USDA key loaded:', API_KEY.slice(0, 8) + '...');
  const results: FoodNutrition[] = [];

  for (const item of foodItems) {
    try {
      const searchRes = await axios.get(`${USDA_BASE}/foods/search`, {
        params: {
          query: item,
          pageSize: 1,
          api_key: API_KEY,
        },
      });

      const food = searchRes.data.foods?.[0];
      if (!food) continue;

      const nutrients = food.foodNutrients;
      const get = (name: string) =>
        nutrients.find((n: any) =>
          n.nutrientName?.toLowerCase().includes(name)
        )?.value ?? 0;

      results.push({
        name: item,
        calories: get('energy'),
        protein: get('protein'),
        carbs: get('carbohydrate'),
        fat: get('total lipid'),
      });
    } catch (err) {
      console.error(`Failed to look up: ${item}`, err);
    }
  }

  return results;
}
