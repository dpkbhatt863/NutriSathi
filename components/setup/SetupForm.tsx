"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useNutriStore } from "@/lib/store";
import { calculateTDEE } from "@/lib/nutrition";
import { profileSchema, type ProfileFormValues, type ProfileFormInput } from "@/lib/schemas/profile";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition";

interface ResultModal {
  name: string;
  goal: Goal;
  targets: MacroTargets;
}

export default function SetupForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const setProfile = useNutriStore((s) => s.setProfile);
  const [modal, setModal] = useState<ResultModal | null>(null);

  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      age: undefined,
      gender: "male",
      weight: undefined,
      height: undefined,
      activity: "moderately_active",
      goal: "maintain",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const targets = calculateTDEE(
      values.weight,
      values.height,
      values.age,
      values.gender,
      values.activity,
      values.goal,
    );

    setProfile({ ...values, targets, userId: session?.user?.email ?? "" });
    setModal({ name: values.name, goal: values.goal, targets });
  };

  const handleStart = () => {
    setModal(null);
    router.push("/dashboard");
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="text"
                    placeholder="Rahul, Priya…"
                    className={INPUT_CLASS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field: { value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <input
                      {...rest}
                      value={value as string ?? ""}
                      type="number"
                      placeholder="25"
                      min={10}
                      max={120}
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select {...field} className={INPUT_CLASS}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Weight + Height */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field: { value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <input
                      {...rest}
                      value={value as string ?? ""}
                      type="number"
                      placeholder="70"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field: { value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <input
                      {...rest}
                      value={value as string ?? ""}
                      type="number"
                      placeholder="170"
                      className={INPUT_CLASS}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Activity Level */}
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <FormControl>
                  <select {...field} className={INPUT_CLASS}>
                    {ACTIVITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Goal */}
          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal</FormLabel>
                <div className="flex gap-3">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-600 border transition-all duration-300 ${
                        field.value === opt.value
                          ? "bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white border-transparent shadow-md"
                          : "border-[#fbebd8] text-[#a89070] bg-white hover:border-[#ff7c2a]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-800 text-base shadow-md hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 mt-2"
          >
            Calculate & Start 🥗
          </button>
        </form>
      </Form>

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
                To{" "}
                <span className="font-700 text-[#ff7c2a]">
                  {GOAL_LABEL[modal.goal]}
                </span>
                , {modal.name}, you need:
              </p>
            </div>

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

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Protein", value: modal.targets.protein, color: "#ff7c2a" },
                { label: "Carbs", value: modal.targets.carbs, color: "#ffb347" },
                { label: "Fat", value: modal.targets.fat, color: "#f59e0b" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-[#fdf6ee] rounded-xl p-3 text-center border border-[#fbebd8]"
                >
                  <p className="text-xl font-900 leading-none" style={{ color: m.color }}>
                    {m.value}
                    <span className="text-sm">g</span>
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
