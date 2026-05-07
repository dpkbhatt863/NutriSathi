"use client";

import type { PendingEntry } from "./ChatInput";

interface ConfirmEntryCardProps {
  entry: PendingEntry;
  isBuildingMeal: boolean;
  onLog: () => void;
  onAddToMeal: () => void;
  onCancel: () => void;
}

export default function ConfirmEntryCard({
  entry,
  isBuildingMeal,
  onLog,
  onAddToMeal,
  onCancel,
}: ConfirmEntryCardProps) {
  return (
    <div className="mx-4 mb-3 p-4 bg-[#fff8f0] border border-[#fbebd8] rounded-2xl shadow-sm">
      <p className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-2">
        Confirm entry
      </p>
      <p className="font-800 text-[#3d2b0e] text-base mb-1">{entry.foodName}</p>
      <div className="flex gap-4 text-sm text-[#a89070] mb-4">
        <span className="font-700 text-[#ff7c2a]">{entry.calories} kcal</span>
        <span>P: {entry.protein}g</span>
        <span>C: {entry.carbs}g</span>
        <span>F: {entry.fat}g</span>
      </div>
      <div className="flex gap-2">
        {isBuildingMeal ? (
          <button
            onClick={onAddToMeal}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition"
          >
            + Add to Meal
          </button>
        ) : (
          <>
            <button
              onClick={onLog}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition"
            >
              Log it ✓
            </button>
            <button
              onClick={onAddToMeal}
              className="flex-1 py-2 rounded-xl border border-[#fbebd8] text-[#3d2b0e] text-sm font-600 hover:border-[#ff7c2a] transition"
            >
              + Add to Meal
            </button>
          </>
        )}
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-[#fbebd8] text-[#a89070] text-sm hover:border-red-300 hover:text-red-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
