import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mealRoutes from './routes/meal';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/meal', mealRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'NutriCoach backend is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// 🔑 Key validation on startup
const requiredEnvVars = ['GEMINI_API_KEY', 'USDA_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
  } else {
    console.log(`✅ ${key} loaded: ${process.env[key]!.slice(0, 8)}...`);
  }
}

