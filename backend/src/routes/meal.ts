import { Router, Request, Response } from 'express';
import { analyseImage } from '../services/vision';
import { lookupNutrition } from '../services/usda';
import { calculateMacros } from '../services/macros';
import { generateNudge } from '../services/nudge';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// ✅ FIX: Lazy getter — only runs AFTER dotenv.config() in server.ts
// Previously, createClient() ran at import time before env vars were loaded
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// ─── POST /api/meal/analyse ───────────────────────────────────────────────────
// Identifies food from image, looks up nutrition, calculates macros,
// generates a nudge, and optionally persists the meal to Supabase
router.post('/analyse', async (req: Request, res: Response) => {
  try {
    const { image, userId } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Step 1: Identify food items from image (mock until Vision API is wired)
    const foodItems = await analyseImage(image);

    // Step 2: Look up nutrition data from USDA
    const nutritionData = await lookupNutrition(foodItems);

    // Step 3: Calculate total macros
    const macros = calculateMacros(nutritionData);

    // Step 4: Generate motivational nudge (mock until LLM is wired)
    const nudge = await generateNudge(macros);

    // Step 5: Persist meal to Supabase (only if userId is provided)
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
        // Log but don't fail the request — meal data still returns to user
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

// ─── POST /api/meal/hunger ────────────────────────────────────────────────────
// Saves a hunger rating (1–5) after a meal to track satiety over time
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

  } catch (error) {
    console.error('❌ Error saving hunger log:', error);
    return res.status(500).json({ error: 'Failed to save hunger rating' });
  }
});

export default router;

