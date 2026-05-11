"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNutriStore } from "@/lib/store";
import { BADGES } from "@/lib/types";
import type { BadgeId } from "@/lib/types";

export function useBadgeEvaluator() {
  const foodLog = useNutriStore((s) => s.foodLog);
  const dailyTotals = useNutriStore((s) => s.dailyTotals);
  const streak = useNutriStore((s) => s.streak);

  const [newBadgesThisSession, setNewBadgesThisSession] = useState<BadgeId[]>([]);

  useEffect(() => {
    const { profile, earnedBadges, addBadge } = useNutriStore.getState();
    if (!profile) return;

    const { targets } = profile;
    const toAdd: BadgeId[] = [];

    const calPct = dailyTotals.calories / targets.calories;
    if (calPct >= 0.8 && calPct <= 1.05 && !earnedBadges.includes("calories_on_track"))
      toAdd.push("calories_on_track");
    if (dailyTotals.protein / targets.protein >= 0.8 && !earnedBadges.includes("protein_on_track"))
      toAdd.push("protein_on_track");
    if (foodLog.length >= 3 && !earnedBadges.includes("three_meals"))
      toAdd.push("three_meals");
    if (streak >= 3 && !earnedBadges.includes("streak_3"))
      toAdd.push("streak_3");
    if (streak >= 7 && !earnedBadges.includes("streak_7"))
      toAdd.push("streak_7");
    if (streak >= 30 && !earnedBadges.includes("streak_30"))
      toAdd.push("streak_30");

    if (toAdd.length === 0) return;

    toAdd.forEach((badgeId) => {
      addBadge(badgeId);
      const badge = BADGES.find((b) => b.id === badgeId)!;
      toast(`${badge.emoji} ${badge.label}`, { description: "Badge earned!" });
    });

    setNewBadgesThisSession((prev) => [...prev, ...toAdd]);

    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff7c2a", "#ffb347", "#ffd580", "#22c55e"],
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodLog, dailyTotals, streak]);

  return { newBadgesThisSession };
}
