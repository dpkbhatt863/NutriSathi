"use client";

import { BADGES } from "@/lib/types";
import type { BadgeId } from "@/lib/types";

interface RewardBadgesProps {
  earned: BadgeId[];
}

export default function RewardBadges({ earned }: RewardBadgesProps) {
  if (earned.length === 0) {
    return (
      <p className="text-xs text-[#a89070] text-center py-2">
        Log meals to earn badges!
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.filter((b) => earned.includes(b.id)).map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[30px] bg-[#fff3e6] border border-[#fbebd8] text-xs font-600 text-[#3d2b0e]"
        >
          <span>{badge.emoji}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
