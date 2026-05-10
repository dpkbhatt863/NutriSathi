"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  UserProfile,
  FoodEntry,
  DailyTotals,
  ChatMessage,
  BadgeId,
  FoodDatabaseItem,
} from "./types";

export type MealBuilderItem = Omit<FoodEntry, "id" | "loggedAt">;

interface NutriState {
  profile: UserProfile | null;
  foodLog: FoodEntry[];
  dailyTotals: DailyTotals;
  chatMessages: ChatMessage[];
  streak: number;
  lastLogDate: string;
  earnedBadges: BadgeId[];
  isBuildingMeal: boolean;
  mealBuilderItems: MealBuilderItem[];
  customFoods: FoodDatabaseItem[];

  setProfile: (profile: UserProfile) => void;
  addFoodEntry: (entry: Omit<FoodEntry, "id" | "loggedAt">) => void;
  clearDailyLog: () => void;
  addMessage: (message: ChatMessage) => void;
  updateStreak: () => void;
  addBadge: (badge: BadgeId) => void;
  checkAndResetDay: () => void;
  clearChat: () => void;
  startMealBuilder: () => void;
  addToMeal: (item: MealBuilderItem) => void;
  removeMealItem: (index: number) => void;
  logMeal: (mealName: string) => void;
  cancelMeal: () => void;
  addCustomFood: (food: Omit<FoodDatabaseItem, "id" | "isCustom">) => void;
  removeCustomFood: (id: string) => void;
}

const todayStr = () => new Date().toISOString().split("T")[0];

const emptyTotals = (): DailyTotals => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

const calcTotals = (log: FoodEntry[]): DailyTotals =>
  log.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    emptyTotals()
  );

export const useNutriStore = create<NutriState>()(
  persist(
    (set, get) => ({
      profile: null,
      foodLog: [],
      dailyTotals: emptyTotals(),
      chatMessages: [],
      streak: 0,
      lastLogDate: "",
      earnedBadges: [],
      isBuildingMeal: false,
      mealBuilderItems: [],
      customFoods: [],

      setProfile: (profile) => set({ profile }),

      addFoodEntry: (entry) => {
        const newEntry: FoodEntry = {
          ...entry,
          id: crypto.randomUUID(),
          loggedAt: new Date().toISOString(),
        };
        const newLog = [...get().foodLog, newEntry];
        set({ foodLog: newLog, dailyTotals: calcTotals(newLog) });
      },

      clearDailyLog: () =>
        set({
          foodLog: [],
          dailyTotals: emptyTotals(),
          earnedBadges: [],
        }),

      addMessage: (message) =>
        set((s) => ({ chatMessages: [...s.chatMessages, message] })),

      updateStreak: () => {
        const today = todayStr();
        const { lastLogDate, streak } = get();
        if (lastLogDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const newStreak = lastLogDate === yesterdayStr ? streak + 1 : 1;
        set({ streak: newStreak, lastLogDate: today });
      },

      addBadge: (badge) => {
        if (!get().earnedBadges.includes(badge)) {
          set((s) => ({ earnedBadges: [...s.earnedBadges, badge] }));
        }
      },

      checkAndResetDay: () => {
        const today = todayStr();
        const { lastLogDate } = get();
        if (lastLogDate && lastLogDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          set({
            foodLog: [],
            dailyTotals: emptyTotals(),
            earnedBadges: [],
            streak: lastLogDate === yesterdayStr ? get().streak : 0,
          });
        }
      },

      clearChat: () => set({ chatMessages: [] }),

      startMealBuilder: () =>
        set({ isBuildingMeal: true, mealBuilderItems: [] }),

      addToMeal: (item) =>
        set((s) => ({ mealBuilderItems: [...s.mealBuilderItems, item] })),

      removeMealItem: (index) =>
        set((s) => ({
          mealBuilderItems: s.mealBuilderItems.filter((_, i) => i !== index),
        })),

      logMeal: (mealName) => {
        const { mealBuilderItems } = get();
        const timestamp = new Date().toISOString();
        const entries: FoodEntry[] = mealBuilderItems.map((item) => ({
          ...item,
          foodName: `${mealName} — ${item.foodName}`,
          id: crypto.randomUUID(),
          loggedAt: timestamp,
        }));
        const newLog = [...get().foodLog, ...entries];
        set({
          foodLog: newLog,
          dailyTotals: calcTotals(newLog),
          isBuildingMeal: false,
          mealBuilderItems: [],
        });
      },

      cancelMeal: () => set({ isBuildingMeal: false, mealBuilderItems: [] }),

      addCustomFood: (food) =>
        set((s) => ({
          customFoods: [
            ...s.customFoods,
            { ...food, id: crypto.randomUUID(), isCustom: true },
          ],
        })),

      removeCustomFood: (id) =>
        set((s) => ({
          customFoods: s.customFoods.filter((f) => f.id !== id),
        })),
    }),
    {
      name: "nutrisathi-store",
      partialize: (s) => ({
        profile: s.profile,
        foodLog: s.foodLog,
        dailyTotals: s.dailyTotals,
        streak: s.streak,
        lastLogDate: s.lastLogDate,
        earnedBadges: s.earnedBadges,
        customFoods: s.customFoods,
      }),
    }
  )
);
