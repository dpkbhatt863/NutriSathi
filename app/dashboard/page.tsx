"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useNutriStore } from "@/lib/store";
import { useBadgeEvaluator } from "@/hooks/useBadgeEvaluator";
import { useDailyReset } from "@/hooks/useDailyReset";
import { useStreakSync } from "@/hooks/useStreakSync";
import { useDashboardState } from "@/hooks/useDashboardState";
import SummaryPanel from "@/components/dashboard/SummaryPanel";
import ActionPanel from "@/components/dashboard/ActionPanel";

export default function DashboardPage() {
  const router = useRouter();
  const profile = useNutriStore((s) => s.profile);

  useDailyReset();
  useBadgeEvaluator();
  useStreakSync();
  const state = useDashboardState();

  useEffect(() => {
    if (!profile) router.replace("/setup");
  }, [profile, router]);

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff7c2a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleReset = () => {
    if (confirm("Reset profile and start over?")) {
      useNutriStore.setState({ profile: null });
      localStorage.removeItem("nutrisathi-store");
      router.replace("/setup");
    }
  };

  return (
    <div className="bg-[#fdf6ee] flex flex-col md:h-screen md:overflow-hidden">
      <header className="shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#fbebd8] bg-white/80 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥗</span>
          <span className="font-900 text-[#3d2b0e] text-lg tracking-tight">NutriSathi</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a89070]">Namaste, {profile.name}!</span>
          <button onClick={handleReset} className="text-xs text-[#a89070] hover:text-[#ff7c2a] transition px-3 py-1.5 rounded-xl border border-[#fbebd8] hover:border-[#ff7c2a]">
            Reset
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-[#a89070] hover:text-[#ff7c2a] transition px-3 py-1.5 rounded-xl border border-[#fbebd8] hover:border-[#ff7c2a]"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full md:overflow-hidden">
        <SummaryPanel />
        <ActionPanel state={state} />
      </div>
    </div>
  );
}
