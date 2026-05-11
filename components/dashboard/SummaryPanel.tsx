"use client";

import { useNutriStore } from "@/lib/store";
import CalorieRing from "./CalorieRing";
import MacroCard from "./MacroCard";
import FoodLog from "./FoodLog";
import StreakBadge from "./StreakBadge";
import RewardBadges from "./RewardBadges";

export default function SummaryPanel() {
  const { profile, foodLog, dailyTotals, streak, earnedBadges, clearDailyLog } =
    useNutriStore();

  if (!profile) return null;

  return (
    <div className="w-full md:w-80 lg:w-96 shrink-0 space-y-4">
      <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-6 flex flex-col items-center gap-4">
        <CalorieRing consumed={dailyTotals.calories} target={profile.targets.calories} />
        <StreakBadge streak={streak} />
      </div>
      <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
        <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-4">Today&apos;s Macros</h3>
        <MacroCard protein={dailyTotals.protein} carbs={dailyTotals.carbs} fat={dailyTotals.fat} targets={profile.targets} />
      </div>
      <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
        <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-3">Badges</h3>
        <RewardBadges earned={earnedBadges} />
      </div>
      <div className="bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] p-5">
        <h3 className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-3">Today&apos;s Log</h3>
        <FoodLog
          entries={foodLog}
          onClear={() => { if (confirm("Clear today's food log?")) clearDailyLog(); }}
        />
      </div>
    </div>
  );
}
