"use client";

import { useState } from "react";
import { useNutriStore } from "@/lib/store";

export default function MealBuilder() {
  const [mealName, setMealName] = useState("");
  const { mealBuilderItems, removeMealItem, logMeal, cancelMeal } =
    useNutriStore();

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
    const name = mealName.trim() || "My Meal";
    logMeal(name);
    setMealName("");
  };

  return (
    <div className="border-t border-[#fbebd8] bg-[#fff8f0] p-4 rounded-b-[20px]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-700 uppercase tracking-widest text-[#ff7c2a]">
          🍱 Meal Builder
        </p>
        <button
          onClick={cancelMeal}
          className="text-xs text-[#a89070] hover:text-red-400 transition"
        >
          Discard
        </button>
      </div>

      {mealBuilderItems.length === 0 ? (
        <p className="text-xs text-[#a89070] text-center py-2">
          Chat above to add items to your meal
        </p>
      ) : (
        <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
          {mealBuilderItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[#fbebd8]"
            >
              <div>
                <p className="text-sm font-700 text-[#3d2b0e]">
                  {item.foodName}
                </p>
                <p className="text-[11px] text-[#a89070]">
                  {item.calories} kcal · P:{item.protein}g C:{item.carbs}g F:
                  {item.fat}g
                </p>
              </div>
              <button
                onClick={() => removeMealItem(i)}
                className="text-[#a89070] hover:text-red-400 text-lg leading-none ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {mealBuilderItems.length > 0 && (
        <>
          <div className="flex gap-3 text-xs text-[#a89070] mb-3 px-1">
            <span className="font-700 text-[#ff7c2a]">
              Total: {totals.calories} kcal
            </span>
            <span>P: {totals.protein}g</span>
            <span>C: {totals.carbs}g</span>
            <span>F: {totals.fat}g</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Meal name (e.g. Lunch)"
              className="flex-1 px-3 py-2 rounded-xl border border-[#fbebd8] bg-white text-sm text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40"
            />
            <button
              onClick={handleLog}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition whitespace-nowrap"
            >
              Log Meal ✓
            </button>
          </div>
        </>
      )}
    </div>
  );
}
