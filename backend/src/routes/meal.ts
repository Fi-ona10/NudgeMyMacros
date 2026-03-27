import { Router, Request, Response } from 'express';
import { analyseImage } from '../services/vision';
import { lookupNutrition } from '../services/usda';
import { calculateMacros } from '../services/macros';
import { generateNudge } from '../services/nudge';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

router.post('/analyse', async (req: Request, res: Response) => {
  try {
    const { image, userId } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Step 1: Identify food items from image
    const foodItems = await analyseImage(image);

    // Step 2: Look up nutrition data
    const nutritionData = await lookupNutrition(foodItems);

    // Step 3: Calculate macros
    const macros = calculateMacros(nutritionData);

    // Step 4: Generate motivational nudge
    const nudge = await generateNudge(macros);

    // Step 5: Persist meal to Supabase (if userId provided)
    if (userId) {
      await supabase.from('meals').insert({
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
    console.error('Error analysing meal:', error);
    return res.status(500).json({ error: 'Failed to analyse meal' });
  }
});

// Persist hunger rating to Supabase
router.post('/hunger', async (req: Request, res: Response) => {
  try {
    const { userId, rating, mealId } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ error: 'userId and rating are required' });
    }

    await supabase.from('hunger_logs').insert({
      user_id: userId,
      hunger_rating: rating,
      meal_id: mealId || null,
    });

    return res.json({ success: true });

  } catch (error) {
    console.error('Error saving hunger log:', error);
    return res.status(500).json({ error: 'Failed to save hunger rating' });
  }
});

export default router;
