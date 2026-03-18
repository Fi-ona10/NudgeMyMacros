import { Router, Request, Response } from 'express';
import { analyseImage } from '../services/vision';
import { lookupNutrition } from '../services/usda';
import { calculateMacros } from '../services/macros';
import { generateNudge } from '../services/nudge';

const router = Router();

router.post('/analyse', async (req: Request, res: Response) => {
  try {
    const { image } = req.body; // base64 image string

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

    return res.json({
      foodItems,
      nutritionData,
      macros,
      nudge,
    });

  } catch (error) {
    console.error('Error analysing meal:', error);
    return res.status(500).json({ error: 'Failed to analyse meal' });
  }
});

export default router;
