"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNutriStore } from "@/lib/store";
import type { FoodDatabaseItem } from "@/lib/types";
import type { PendingEntry } from "@/components/chat/ChatInput";

interface FoodSearchProps {
  onPendingEntry: (entry: PendingEntry) => void;
}

function calcNutrition(item: FoodDatabaseItem, grams: number) {
  const r = grams / 100;
  return {
    calories: Math.round(item.caloriesPer100g * r),
    protein: Math.round(item.proteinPer100g * r * 10) / 10,
    carbs: Math.round(item.carbsPer100g * r * 10) / 10,
    fat: Math.round(item.fatPer100g * r * 10) / 10,
  };
}

export default function FoodSearch({ onPendingEntry }: FoodSearchProps) {
  const { customFoods } = useNutriStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodDatabaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodDatabaseItem | null>(null);
  const [grams, setGrams] = useState("100");
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setShowDropdown(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/food-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      // Prepend matching custom foods
      const matchingCustom = customFoods.filter((f) =>
        f.name.toLowerCase().includes(q.toLowerCase()) ||
        f.brand?.toLowerCase().includes(q.toLowerCase())
      );
      setResults([...matchingCustom, ...(data.products ?? [])]);
      setShowDropdown(true);
    } finally {
      setLoading(false);
    }
  }, [customFoods]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: FoodDatabaseItem) => {
    setSelected(item);
    setGrams("100");
    setShowDropdown(false);
    setQuery(item.name);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const g = parseFloat(grams);
    if (!g || g <= 0) return;
    const nutrition = calcNutrition(selected, g);
    onPendingEntry({
      foodName: `${selected.name}${selected.brand ? ` (${selected.brand})` : ""} — ${g}g`,
      ...nutrition,
    });
    setSelected(null);
    setQuery("");
    setGrams("100");
  };

  const nutrition = selected ? calcNutrition(selected, parseFloat(grams) || 0) : null;

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Search input */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder="Search food — e.g. Quaker oats, Amul milk…"
            className="w-full px-4 py-3 pr-10 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#ff7c2a] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#fbebd8] rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-[#fff3e6] transition border-b border-[#fbebd8] last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-700 text-[#3d2b0e] truncate">
                      {item.isCustom && (
                        <span className="text-[10px] bg-[#fff3e6] text-[#ff7c2a] border border-[#fbebd8] rounded px-1 mr-1">
                          custom
                        </span>
                      )}
                      {item.name}
                    </p>
                    {item.brand && (
                      <p className="text-[11px] text-[#a89070]">{item.brand}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-800 text-[#ff7c2a]">
                      {item.caloriesPer100g} kcal
                    </p>
                    <p className="text-[10px] text-[#a89070]">per 100g</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && !loading && results.length === 0 && query.length >= 2 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#fbebd8] rounded-xl shadow px-4 py-3 text-sm text-[#a89070]">
            No results found. Try a different spelling or add it as a custom food.
          </div>
        )}
      </div>

      {/* Quantity selector — shown after selecting an item */}
      {selected && (
        <div className="bg-[#fff8f0] border border-[#fbebd8] rounded-xl p-4 space-y-3">
          <div>
            <p className="font-800 text-[#3d2b0e] text-sm">{selected.name}</p>
            {selected.brand && (
              <p className="text-[11px] text-[#a89070]">{selected.brand}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-700 uppercase tracking-widest text-[#a89070] shrink-0">
              Quantity (g)
            </label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              min={1}
              className="w-24 px-3 py-2 rounded-lg border border-[#fbebd8] bg-white text-[#3d2b0e] text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40"
            />
          </div>

          {/* Live nutrition preview */}
          {nutrition && parseFloat(grams) > 0 && (
            <div className="flex gap-4 text-sm">
              <span className="font-800 text-[#ff7c2a]">{nutrition.calories} kcal</span>
              <span className="text-[#a89070]">P: {nutrition.protein}g</span>
              <span className="text-[#a89070]">C: {nutrition.carbs}g</span>
              <span className="text-[#a89070]">F: {nutrition.fat}g</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={!grams || parseFloat(grams) <= 0}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition disabled:opacity-40"
            >
              Add to Log
            </button>
            <button
              onClick={() => { setSelected(null); setQuery(""); }}
              className="px-4 py-2.5 rounded-xl border border-[#fbebd8] text-[#a89070] text-sm hover:border-red-300 hover:text-red-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
