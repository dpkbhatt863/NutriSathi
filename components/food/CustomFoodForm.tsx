"use client";

import { useState } from "react";
import { useNutriStore } from "@/lib/store";

interface CustomFoodFormProps {
  onDone: () => void;
}

export default function CustomFoodForm({ onDone }: CustomFoodFormProps) {
  const { addCustomFood, customFoods, removeCustomFood } = useNutriStore();
  const [tab, setTab] = useState<"add" | "saved">("add");
  const [form, setForm] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  });
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleAdd = () => {
    if (!form.name.trim()) { setError("Food name is required"); return; }
    if (!form.calories || +form.calories <= 0) { setError("Calories required"); return; }
    setError("");
    addCustomFood({
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      caloriesPer100g: Math.round(+form.calories),
      proteinPer100g: parseFloat(form.protein) || 0,
      carbsPer100g: parseFloat(form.carbs) || 0,
      fatPer100g: parseFloat(form.fat) || 0,
    });
    setForm({ name: "", brand: "", calories: "", protein: "", carbs: "", fat: "" });
    setTab("saved");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["add", "saved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-700 border transition ${
              tab === t
                ? "bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white border-transparent"
                : "border-[#fbebd8] text-[#a89070] hover:border-[#ff7c2a]"
            }`}
          >
            {t === "add" ? "Add New Food" : `Saved (${customFoods.length})`}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <div className="space-y-3">
          <p className="text-xs text-[#a89070]">
            Values are per <strong>100g</strong>. Once saved, it appears in your food search.
          </p>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Food name *"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-sm text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40"
            />
            <input
              type="text"
              placeholder="Brand (optional)"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-sm text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "calories", label: "Calories (kcal) *" },
              { key: "protein", label: "Protein (g)" },
              { key: "carbs", label: "Carbs (g)" },
              { key: "fat", label: "Fat (g)" },
            ].map(({ key, label }) => (
              <input
                key={key}
                type="number"
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-sm text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40"
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition"
            >
              Save Food
            </button>
            <button
              onClick={onDone}
              className="px-4 py-2.5 rounded-xl border border-[#fbebd8] text-[#a89070] text-sm hover:border-[#ff7c2a] transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {tab === "saved" && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {customFoods.length === 0 ? (
            <p className="text-sm text-[#a89070] text-center py-4">
              No custom foods saved yet.
            </p>
          ) : (
            customFoods.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between bg-[#fdf6ee] rounded-xl px-3 py-2.5 border border-[#fbebd8]"
              >
                <div>
                  <p className="text-sm font-700 text-[#3d2b0e]">{f.name}</p>
                  <p className="text-[11px] text-[#a89070]">
                    {f.brand && `${f.brand} · `}{f.caloriesPer100g} kcal · P:{f.proteinPer100g}g C:{f.carbsPer100g}g F:{f.fatPer100g}g /100g
                  </p>
                </div>
                <button
                  onClick={() => removeCustomFood(f.id)}
                  className="text-[#a89070] hover:text-red-400 text-lg leading-none ml-2 shrink-0"
                >
                  ×
                </button>
              </div>
            ))
          )}
          <button
            onClick={onDone}
            className="w-full mt-2 py-2 rounded-xl border border-[#fbebd8] text-[#a89070] text-sm hover:border-[#ff7c2a] transition"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
