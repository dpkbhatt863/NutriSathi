export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  activity: ActivityLevel;
  goal: Goal;
  targets: MacroTargets;
}

export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extra_active";

export type Goal = "lose" | "maintain" | "gain";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type BadgeId =
  | "calories_on_track"
  | "protein_on_track"
  | "three_meals"
  | "streak_3"
  | "streak_7"
  | "streak_30";

export interface Badge {
  id: BadgeId;
  emoji: string;
  label: string;
}

export const BADGES: Badge[] = [
  { id: "calories_on_track", emoji: "⭐", label: "Calories on track" },
  { id: "protein_on_track", emoji: "💪", label: "Protein on track" },
  { id: "three_meals", emoji: "🎯", label: "3+ meals logged" },
  { id: "streak_3", emoji: "🔥", label: "3-day streak" },
  { id: "streak_7", emoji: "💎", label: "7-day streak" },
  { id: "streak_30", emoji: "👑", label: "30-day streak" },
];

export interface FoodDatabaseItem {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  isCustom?: boolean;
}

export interface NutriData {
  action: "log";
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
