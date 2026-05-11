"use client";

import { useEffect } from "react";
import { useNutriStore } from "@/lib/store";

export function useStreakSync() {
  const foodLog = useNutriStore((s) => s.foodLog);
  const updateStreak = useNutriStore((s) => s.updateStreak);
  useEffect(() => { updateStreak(); }, [foodLog, updateStreak]);
}
