"use client";

export default function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[30px] bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-700 text-sm shadow">
      <span className="text-base">🔥</span>
      <span>{streak}-day streak</span>
    </div>
  );
}
