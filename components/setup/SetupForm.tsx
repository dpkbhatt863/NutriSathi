"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNutriStore } from "@/lib/store";
import { calculateTDEE } from "@/lib/nutrition";
import type { ActivityLevel, Goal, MacroTargets } from "@/lib/types";

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary (desk job, no exercise)" },
  { value: "lightly_active", label: "Lightly active (1–3 days/week)" },
  { value: "moderately_active", label: "Moderately active (3–5 days/week)" },
  { value: "very_active", label: "Very active (6–7 days/week)" },
  { value: "extra_active", label: "Extra active (athlete / physical job)" },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain weight" },
];

const GOAL_LABEL: Record<Goal, string> = {
  lose: "lose weight",
  maintain: "maintain weight",
  gain: "gain weight",
};

interface ResultModal {
  name: string;
  goal: Goal;
  targets: MacroTargets;
}

export default function SetupForm() {
  const router = useRouter();
  const setProfile = useNutriStore((s) => s.setProfile);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female",
    weight: "",
    height: "",
    activity: "moderately_active" as ActivityLevel,
    goal: "maintain" as Goal,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<ResultModal | null>(null);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age || +form.age < 10 || +form.age > 120)
      e.age = "Enter a valid age (10–120)";
    if (!form.weight || +form.weight < 20 || +form.weight > 300)
      e.weight = "Enter a valid weight (20–300 kg)";
    if (!form.height || +form.height < 100 || +form.height > 250)
      e.height = "Enter a valid height (100–250 cm)";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const targets = calculateTDEE(
      +form.weight,
      +form.height,
      +form.age,
      form.gender,
      form.activity,
      form.goal,
    );

    setProfile({
      name: form.name.trim(),
      age: +form.age,
      gender: form.gender,
      weight: +form.weight,
      height: +form.height,
      activity: form.activity,
      goal: form.goal,
      targets,
    });

    // Show targets modal before navigating
    setModal({ name: form.name.trim(), goal: form.goal, targets });
  };

  const handleStart = () => {
    setModal(null);
    router.push("/dashboard");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Rahul, Priya…"
            className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Age + Gender row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
              Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder="25"
              min={10}
              max={120}
              className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
            />
            {errors.age && (
              <p className="text-red-500 text-xs mt-1">{errors.age}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Weight + Height row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={form.weight}
              onChange={(e) => set("weight", e.target.value)}
              placeholder="70"
              className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
            />
            {errors.weight && (
              <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              value={form.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder="170"
              className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
            />
            {errors.height && (
              <p className="text-red-500 text-xs mt-1">{errors.height}</p>
            )}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
            Activity Level
          </label>
          <select
            value={form.activity}
            onChange={(e) => set("activity", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition"
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-xs font-700 uppercase tracking-widest text-[#a89070] mb-1">
            Goal
          </label>
          <div className="flex gap-3">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("goal", opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all duration-300 ${
                  form.goal === opt.value
                    ? "bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white border-transparent shadow-md"
                    : "border-[#fbebd8] text-[#a89070] bg-white hover:border-[#ff7c2a]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-800 text-base shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 mt-2"
        >
          Calculate & Start 🥗
        </button>
      </form>

      {/* Targets modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl border border-[#fbebd8] p-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-xl font-900 text-[#3d2b0e] tracking-tight">
                Your Daily Targets
              </h2>
              <p className="text-sm text-[#a89070] mt-1">
                To <span className="font-700 text-[#ff7c2a]">{GOAL_LABEL[modal.goal]}</span>,{" "}
                {modal.name}, you need:
              </p>
            </div>

            {/* Big calorie number */}
            <div className="text-center bg-gradient-to-br from-[#ff7c2a] to-[#ffb347] rounded-2xl py-5 mb-4">
              <p
                className="text-5xl font-900 text-white leading-none"
                style={{ letterSpacing: "-2px" }}
              >
                {modal.targets.calories}
              </p>
              <p className="text-white/80 text-sm mt-1 uppercase tracking-widest font-600">
                calories / day
              </p>
            </div>

            {/* Macro grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Protein", value: modal.targets.protein, unit: "g", color: "#ff7c2a" },
                { label: "Carbs", value: modal.targets.carbs, unit: "g", color: "#ffb347" },
                { label: "Fat", value: modal.targets.fat, unit: "g", color: "#f59e0b" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-[#fdf6ee] rounded-xl p-3 text-center border border-[#fbebd8]"
                >
                  <p
                    className="text-xl font-900 leading-none"
                    style={{ color: m.color }}
                  >
                    {m.value}
                    <span className="text-sm">{m.unit}</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-[#a89070] mt-1">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-800 text-base shadow-md hover:opacity-90 transition"
            >
              Let&apos;s Start Tracking! 🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
}
