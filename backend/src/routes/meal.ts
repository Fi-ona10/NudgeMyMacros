import { Router, Request, Response } from 'express';
import { analyseImage } from '../services/vision';
import { lookupNutrition } from '../services/usda';
import { calculateMacros } from '../services/macros';
import { generateNudge } from '../services/nudge';
import { createClient } from '@supabase/supabase-js';

const router = Router();

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

router.post('/analyse', async (req: Request, res: Response) => {
  try {
    const { image, userId } = req.body;
    console.log('📸 Image received:', image ? `YES (${image.length} chars, starts: ${image.slice(0, 30)})` : 'NO/EMPTY');

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const foodItems = await analyseImage(image);
    const nutritionData = await lookupNutrition(foodItems);
    const macros = calculateMacros(nutritionData);
    const nudge = await generateNudge(macros);

    if (userId) {
      const { error: dbError } = await getSupabase()
        .from('meals')
        .insert({
          user_id: userId,
          foods: foodItems,
          macros: {
            calories: macros.totalCalories,
            protein: macros.totalProtein,
            carbs: macros.totalCarbs,
            fat: macros.totalFat,
          },
          nudge,
        });

      if (dbError) {
        console.error('⚠️  Failed to save meal to Supabase:', dbError.message);
      }
    }

    return res.json({
      foodItems,
      macros: {
        calories: macros.totalCalories,
        protein: macros.totalProtein,
        carbs: macros.totalCarbs,
        fat: macros.totalFat,
      },
      nudge,
    });

  } catch (error) {
    console.error('❌ Error analysing meal:', error);
    return res.status(500).json({ error: 'Failed to analyse meal' });
  }
});

router.post('/hunger', async (req: Request, res: Response) => {
  try {
    const { userId, rating, mealId } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ error: 'userId and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { error: dbError } = await getSupabase()
      .from('hunger_logs')
      .insert({
        user_id: userId,
        hunger_rating: rating,
        meal_id: mealId ?? null,
      });

    if (dbError) {
      console.error('⚠️  Failed to save hunger log:', dbError.message);
      return res.status(500).json({ error: 'Failed to save hunger rating' });
    }

    return res.json({ success: true });

} catch (error: any) {
  console.error('❌ Error analysing meal:', error?.message || error);
  console.error('Stack:', error?.stack);
  return res.status(500).json({ error: 'Failed to analyse meal', details: error?.message });
}

});

export default router;
