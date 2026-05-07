import type { ActivityLevel, Goal, MacroTargets } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -300,
  maintain: 0,
  gain: 350,
};

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activity: ActivityLevel,
  goal: Goal
): MacroTargets {
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  const protein = Math.round(weight * 1.8);
  const carbs = Math.round((targetCalories * 0.5) / 4);
  const fat = Math.round((targetCalories * 0.25) / 9);

  return { calories: targetCalories, protein, carbs, fat };
}
