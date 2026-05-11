"use client";

import { useEffect } from "react";
import { useNutriStore } from "@/lib/store";

export function useDailyReset() {
  const checkAndResetDay = useNutriStore((s) => s.checkAndResetDay);
  useEffect(() => { checkAndResetDay(); }, [checkAndResetDay]);
}
