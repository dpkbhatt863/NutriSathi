"use client";

import type { FoodEntry } from "@/lib/types";

interface FoodLogProps {
  entries: FoodEntry[];
  onClear: () => void;
}

export default function FoodLog({ entries, onClear }: FoodLogProps) {
  if (entries.length === 0) {
    return (
      <p className="text-xs text-[#a89070] text-center py-4">
        No meals logged today. Start chatting! 👇
      </p>
    );
  }

  return (
    <div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#fdf6ee] border-l-4 border-[#ff7c2a]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-[#3d2b0e] truncate">
                {entry.foodName}
              </p>
              <p className="text-[11px] text-[#a89070] mt-0.5">
                P:{entry.protein}g · C:{entry.carbs}g · F:{entry.fat}g
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-800 text-[#ff7c2a]">
                {entry.calories} kcal
              </p>
              <p className="text-[10px] text-[#a89070]">
                {new Date(entry.loggedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onClear}
        className="mt-3 w-full text-xs text-[#a89070] hover:text-red-500 transition py-1 border border-[#fbebd8] rounded-xl hover:border-red-300"
      >
        Clear today&apos;s log
      </button>
    </div>
  );
}
