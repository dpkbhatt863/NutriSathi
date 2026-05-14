"use client";

import { useState } from "react";
import { useNutriStore } from "@/lib/store";

export default function MealBuilder() {
  const [mealName, setMealName] = useState("");
  const { mealBuilderItems, removeMealItem, logMeal, cancelMeal } = useNutriStore();

  const totals = mealBuilderItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleLog = () => {
    if (mealBuilderItems.length === 0) return;
    logMeal(mealName.trim() || "My Meal");
    setMealName("");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#fff8f0]">
      {/* Discard */}
      <div className="flex justify-end px-4 pt-3 pb-1">
        <button
          onClick={cancelMeal}
          className="text-xs text-[#a89070] hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          Discard all
        </button>
      </div>

      {/* Scrollable items */}
      <div className="flex-1 overflow-y-auto px-3 pb-1 space-y-1.5 min-h-0">
        {mealBuilderItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#fbebd8] shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-[#3d2b0e] truncate">{item.foodName}</p>
              <div className="flex gap-2 mt-0.5 text-[11px]">
                <span className="font-700 text-[#ff7c2a]">{item.calories} kcal</span>
                <span className="text-[#a89070]">P:{item.protein}g</span>
                <span className="text-[#a89070]">C:{item.carbs}g</span>
                <span className="text-[#a89070]">F:{item.fat}g</span>
              </div>
            </div>
            <button
              onClick={() => removeMealItem(i)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#c4a882] hover:text-red-400 hover:bg-red-50 transition text-lg leading-none"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mx-3 mt-2 px-3 py-2 bg-white rounded-xl border border-[#fbebd8] flex items-center gap-3 text-xs">
        <span className="font-800 text-[#ff7c2a]">{totals.calories} kcal total</span>
        <span className="text-[#a89070]">P:{totals.protein}g</span>
        <span className="text-[#a89070]">C:{totals.carbs}g</span>
        <span className="text-[#a89070]">F:{totals.fat}g</span>
      </div>

      {/* Log form */}
      <div className="flex gap-2 p-3">
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLog()}
          placeholder="Name this meal (e.g. Lunch)"
          className="flex-1 px-3 py-2.5 rounded-xl border border-[#fbebd8] bg-white text-sm text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
        />
        <button
          onClick={handleLog}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition shadow-sm whitespace-nowrap"
        >
          Log Meal ✓
        </button>
      </div>
    </div>
  );
}
