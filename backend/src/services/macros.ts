import { FoodNutrition } from './usda';

export interface MacroSummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: number;
}

export function calculateMacros(foods: FoodNutrition[]): MacroSummary {
  return {
    totalCalories: Math.round(
      foods.reduce((sum, f) => sum + f.calories, 0)
    ),
    totalProtein: Math.round(
      foods.reduce((sum, f) => sum + f.protein, 0)
    ),
    totalCarbs: Math.round(
      foods.reduce((sum, f) => sum + f.carbs, 0)
    ),
    totalFat: Math.round(
      foods.reduce((sum, f) => sum + f.fat, 0)
    ),
    items: foods.length,
  };
}
