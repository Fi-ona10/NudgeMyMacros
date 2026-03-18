import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NudgeMyMacros backend is running!' });
});

// ── USDA Food Lookup ──────────────────────────────────────────────────────────
app.get('/api/food/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=1&api_key=${process.env.USDA_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.foods || data.foods.length === 0) {
      return res.status(404).json({ error: 'No food found for that query.' });
    }

    const topResult = data.foods[0];
    const nutrients = topResult.foodNutrients;
    const find = (name) => nutrients.find(n => n.nutrientName === name)?.value ?? null;

    const clean = {
      name: topResult.description,
      brand: topResult.brandOwner || null,
      category: topResult.foodCategory || null,
      macros: {
        calories: find('Energy'),
        protein_g: find('Protein'),
        carbs_g: find('Carbohydrate, by difference'),
        fat_g: find('Total lipid (fat)'),
        fiber_g: find('Fiber, total dietary'),
        sugar_g: find('Sugars, total including NLEA'),
        sodium_mg: find('Sodium, Na'),
      },
    };

    res.json(clean);
  } catch (err) {
    res.status(500).json({ error: 'USDA lookup failed', details: err.message });
  }
});

// ── Meal Analysis ─────────────────────────────────────────────────────────────
// Mock now → replace Step 1 with Langdock Vision call when API key arrives
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, goal, hungerRating, recentMeals } = req.body;

    // ── Step 1: Identify foods (MOCK - replace with GPT-4o Vision later) ──
    const identifiedFoods = [
      'Grilled chicken breast',
      'Steamed broccoli',
      'White rice',
    ];

    // ── Step 2: Look up real macros from USDA for each food ──
    let totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const foodsWithMacros = [];

    for (const food of identifiedFoods) {
      try {
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&pageSize=1&api_key=${process.env.USDA_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.foods && data.foods.length > 0) {
          const nutrients = data.foods[0].foodNutrients;
          const find = (name) => nutrients.find(n => n.nutrientName === name)?.value ?? 0;

          const macros = {
            calories: find('Energy'),
            protein: find('Protein'),
            carbs: find('Carbohydrate, by difference'),
            fat: find('Total lipid (fat)'),
          };

          totalMacros.calories += macros.calories;
          totalMacros.protein += macros.protein;
          totalMacros.carbs += macros.carbs;
          totalMacros.fat += macros.fat;

          foodsWithMacros.push({ food, macros });
        }
      } catch (e) {
        console.warn(`USDA lookup failed for: ${food}`);
      }
    }

    // ── Step 3: Generate nudge (MOCK - replace with GPT-4o LLM later) ──
    const nudge = generateMockNudge(goal, totalMacros, hungerRating);

    res.json({
      foods: identifiedFoods,
      foodsWithMacros,
      macros: {
        protein: Math.round(totalMacros.protein),
        carbs: Math.round(totalMacros.carbs),
        fat: Math.round(totalMacros.fat),
        calories: Math.round(totalMacros.calories),
      },
      nudge,
    });

  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// ── Mock nudge generator (replace with LLM call later) ───────────────────────
function generateMockNudge(goal, macros, hungerRating) {
  if (hungerRating >= 4) {
    return 'You were still hungry after this meal. Try adding a palm-sized protein source next time to stay fuller longer!';
  }
  if (goal === 'Build muscle & get stronger' && macros.protein < 30) {
    return 'Protein was a bit low for your muscle goal. Next time add a boiled egg or Greek yogurt to hit closer to 40g!';
  }
  if (goal === 'Lose body fat' && macros.calories > 700) {
    return 'Slightly high on calories for fat loss. Try halving the rice portion and adding more veggies to stay full with fewer calories.';
  }
  return 'Great meal! Small tip: swap white rice for quinoa to get the same volume with more protein and fiber. Keep it up!';
}

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`✅ USDA key loaded: ${process.env.USDA_API_KEY ? 'YES' : 'NO - check .env'}`);
});
