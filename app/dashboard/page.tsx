"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNutriStore } from "@/lib/store";
import CalorieRing from "@/components/dashboard/CalorieRing";
import MacroCard from "@/components/dashboard/MacroCard";
import FoodLog from "@/components/dashboard/FoodLog";
import StreakBadge from "@/components/dashboard/StreakBadge";
import RewardBadges from "@/components/dashboard/RewardBadges";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput, { type PendingEntry } from "@/components/chat/ChatInput";
import MealBuilder from "@/components/chat/MealBuilder";
import type { BadgeId } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [prefill, setPrefill] = useState<string | undefined>();
  const [pendingEntry, setPendingEntry] = useState<PendingEntry | null>(null);

  const {
    profile,
    foodLog,
    dailyTotals,
    chatMessages,
    streak,
    earnedBadges,
    isBuildingMeal,
    mealBuilderItems,
    clearDailyLog,
    checkAndResetDay,
    clearChat,
    addFoodEntry,
    updateStreak,
    addBadge,
    startMealBuilder,
    addToMeal,
  } = useNutriStore();

  useEffect(() => {
    checkAndResetDay();
  }, [checkAndResetDay]);

  useEffect(() => {
    if (!profile) router.replace("/setup");
  }, [profile, router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff7c2a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const triggerConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff7c2a", "#ffb347", "#ffd580", "#22c55e"],
    });
  };

  const checkAndAwardBadges = () => {
    const state = useNutriStore.getState();
    const { targets } = profile;
    const t = state.dailyTotals;
    const toAdd: BadgeId[] = [];

    const calPct = t.calories / targets.calories;
    if (calPct >= 0.8 && calPct <= 1.05 && !state.earnedBadges.includes("calories_on_track"))
      toAdd.push("calories_on_track");
    if (t.protein / targets.protein >= 0.8 && !state.earnedBadges.includes("protein_on_track"))
      toAdd.push("protein_on_track");
    if (state.foodLog.length >= 3 && !state.earnedBadges.includes("three_meals"))
      toAdd.push("three_meals");
    if (state.streak >= 3 && !state.earnedBadges.includes("streak_3"))
      toAdd.push("streak_3");
    if (state.streak >= 7 && !state.earnedBadges.includes("streak_7"))
      toAdd.push("streak_7");
    if (state.streak >= 30 && !state.earnedBadges.includes("streak_30"))
      toAdd.push("streak_30");

    if (toAdd.length > 0) {
      toAdd.forEach((b) => addBadge(b));
      triggerConfetti();
    }
  };

  const handleLog = () => {
    if (!pendingEntry) return;
    addFoodEntry(pendingEntry);
    updateStreak();
    setPendingEntry(null);
    setTimeout(checkAndAwardBadges, 100);
  };

  const handleAddToMeal = () => {
    if (!pendingEntry) return;
    if (!isBuildingMeal) startMealBuilder();
    addToMeal(pendingEntry);
    setPendingEntry(null);
  };

  const handleClearLog = () => {
    if (confirm("Clear today's food log?")) clearDailyLog();
  };

  const handleReset = () => {
    if (confirm("Reset profile and start over?")) {
      useNutriStore.setState({ profile: null });
      localStorage.removeItem("nutrisathi-store");
      router.replace("/setup");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6ee]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#fbebd8] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-900 text-[#3d2b0e] text-lg tracking-tight">
            NutriSathi
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a89070]">Namaste, {profile.name}!</span>
          <button
            onClick={handleReset}
            className="text-xs text-[#a89070] hover:text-[#ff7c2a] transition px-3 py-1.5 rounded-xl border border-[#fbebd8] hover:border-[#ff7c2a]"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-8 max-w-6xl mx-auto">
        {/* Left panel — Stats */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-4">
          <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-6 flex flex-col items-center gap-4">
            <CalorieRing consumed={dailyTotals.calories} target={profile.targets.calories} />
            <StreakBadge streak={streak} />
          </div>

          <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-4">
              Today&apos;s Macros
            </h3>
            <MacroCard
              protein={dailyTotals.protein}
              carbs={dailyTotals.carbs}
              fat={dailyTotals.fat}
              targets={profile.targets}
            />
          </div>

          <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-3">
              Badges
            </h3>
            <RewardBadges earned={earnedBadges} />
          </div>

          <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-3">
              Today&apos;s Log
            </h3>
            <FoodLog entries={foodLog} onClear={handleClearLog} />
          </div>
        </div>

        {/* Right panel — Chat */}
        <div className="flex-1 bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] flex flex-col min-h-[500px] md:min-h-[calc(100vh-140px)] max-h-[calc(100vh-140px)] sticky top-[76px]">
          {/* Chat header */}
          <div className="px-5 py-4 border-b border-[#fbebd8] flex items-center justify-between">
            <div>
              <h2 className="font-800 text-[#3d2b0e]">Log your meals</h2>
              <p className="text-xs text-[#a89070] mt-0.5">
                Hinglish works — do roti, ek katori dal
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isBuildingMeal && (
                <button
                  onClick={startMealBuilder}
                  className="text-xs px-3 py-1.5 rounded-xl border border-[#fbebd8] text-[#ff7c2a] font-600 hover:bg-[#fff3e6] transition"
                >
                  🍱 Build Meal
                </button>
              )}
              {chatMessages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs text-[#a89070] hover:text-[#ff7c2a] transition"
                >
                  Clear chat
                </button>
              )}
            </div>
          </div>

          {/* Messages + confirmation */}
          <ChatWindow
            messages={chatMessages}
            pendingEntry={pendingEntry}
            isBuildingMeal={isBuildingMeal}
            onLog={handleLog}
            onAddToMeal={handleAddToMeal}
            onCancelPending={() => setPendingEntry(null)}
            onExampleClick={(text) => setPrefill(text)}
          />

          {/* Meal builder panel */}
          {isBuildingMeal && <MealBuilder />}

          {/* Input always visible */}
          <ChatInput
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(undefined)}
            onPendingEntry={setPendingEntry}
          />
        </div>
      </div>
    </div>
  );
}
