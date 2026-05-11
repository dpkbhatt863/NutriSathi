"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNutriStore } from "@/lib/store";
import type { FoodEntry } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getLast7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function wasLogged(
  date: Date,
  todayStr: string,
  foodLog: FoodEntry[],
  lastLogDate: string,
  streak: number
): boolean {
  const dateStr = toDateStr(date);

  // Today: check actual foodLog entries
  if (dateStr === todayStr) {
    return foodLog.some((e) => e.loggedAt.startsWith(todayStr));
  }

  // Past days: infer from streak window anchored at lastLogDate
  if (!lastLogDate || streak === 0) return false;
  const anchor = new Date(lastLogDate + "T00:00:00");
  const daysFromAnchor = Math.round(
    (anchor.getTime() - date.getTime()) / 86_400_000
  );
  return daysFromAnchor >= 0 && daysFromAnchor < streak;
}

export default function WeeklyCalendar() {
  const foodLog = useNutriStore((s) => s.foodLog);
  const lastLogDate = useNutriStore((s) => s.lastLogDate);
  const streak = useNutriStore((s) => s.streak);

  const [todayStr, setTodayStr] = useState("");
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    setTodayStr(toDateStr(new Date()));
    setDays(getLast7Days());
  }, []);

  if (days.length === 0) {
    return (
      <div className="flex justify-between items-end w-full">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-[#e5e7eb]" />
            <span className="text-[10px] leading-none text-[#a89070]">···</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-between items-end w-full">
      {days.map((day, i) => {
        const dateStr = toDateStr(day);
        const isToday = dateStr === todayStr;
        const logged = wasLogged(day, todayStr, foodLog, lastLogDate, streak);
        const dayLabel = DAY_LABELS[day.getDay()];

        return (
          <motion.div
            key={dateStr}
            className="flex flex-col items-center gap-1"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.06,
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: isToday ? 20 : 16,
                height: isToday ? 20 : 16,
                backgroundColor: logged ? "#ff7c2a" : "transparent",
                border: logged
                  ? "none"
                  : isToday
                  ? "2px solid #ff7c2a"
                  : "2px solid #e5e7eb",
              }}
            >
              {logged && (
                <Check
                  size={isToday ? 12 : 10}
                  strokeWidth={3}
                  color="white"
                />
              )}
            </div>
            <span
              className="text-[10px] leading-none"
              style={{ color: isToday ? "#ff7c2a" : "#a89070" }}
            >
              {dayLabel}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
