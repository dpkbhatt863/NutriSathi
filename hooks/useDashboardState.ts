"use client";

import { useState } from "react";
import { useNutriStore } from "@/lib/store";
import type { PendingEntry } from "@/lib/types";

export type RightTab = "search" | "ai";

export interface DashboardState {
  tab: RightTab;
  setTab: (t: RightTab) => void;
  prefill: string | undefined;
  setPrefill: (v: string | undefined) => void;
  pendingEntry: PendingEntry | null;
  setPendingEntry: (e: PendingEntry | null) => void;
  showCustomForm: boolean;
  setShowCustomForm: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleLog: () => void;
  handleAddToMeal: () => void;
}

export function useDashboardState(): DashboardState {
  const [tab, setTab] = useState<RightTab>("search");
  const [prefill, setPrefill] = useState<string | undefined>();
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const { addFoodEntry, isBuildingMeal, startMealBuilder, addToMeal } =
    useNutriStore();

  const handleLog = () => {
    if (!pendingEntry) return;
    addFoodEntry(pendingEntry);
    setPendingEntry(null);
  };

  const handleAddToMeal = () => {
    if (!pendingEntry) return;
    if (!isBuildingMeal) startMealBuilder();
    addToMeal(pendingEntry);
    setPendingEntry(null);
  };

  return {
    tab, setTab,
    prefill, setPrefill,
    pendingEntry, setPendingEntry,
    showCustomForm, setShowCustomForm,
    handleLog,
    handleAddToMeal,
  };
}
