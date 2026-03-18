import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'NudgeMyMacros backend is running!' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, goal } = req.body;
    // Mock response for now - replace with real OpenAI call later
    res.json({
      foods: ['Grilled chicken breast', 'Steamed broccoli', 'White rice'],
      macros: { protein: 42, carbs: 90, fat: 20, calories: 740 },
      nudge: 'Great meal for your goal! Try swapping half the white rice for quinoa next time to boost protein. 💪'
    });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log('✅ Backend running on http://localhost:' + PORT);
  console.log('✅ Health check: http://localhost:' + PORT + '/health');
});
