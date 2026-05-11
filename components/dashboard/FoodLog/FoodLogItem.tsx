"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { FoodEntry } from "@/lib/types";
import { NutriPill } from "@/components/shared/NutriPill";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

interface FoodLogItemProps {
  entry: FoodEntry;
  onDelete: (id: string) => void;
}

export function FoodLogItem({ entry, onDelete }: FoodLogItemProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-80, -40], [1, 0]);
  const isDragging = useRef(false);

  function handleDragEnd() {
    if (x.get() < -60) {
      onDelete(entry.id);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }

  return (
    <div className="relative overflow-hidden" style={{ height: 52, borderBottom: "1px solid #fbebd8" }}>
      {/* Delete background */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end px-5 rounded-r-sm"
        style={{ backgroundColor: "#ef4444", opacity: deleteOpacity, left: 0 }}
        aria-hidden
      >
        <Trash2 className="text-white" size={18} />
      </motion.div>

      {/* Swipeable row */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-3 bg-white"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.05}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
      >
        {/* Left */}
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs text-[#a89070]">{formatTime(entry.loggedAt)}</span>
          <span className="text-sm font-semibold text-[#3d2b0e] truncate">{entry.foodName}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <NutriPill variant="calories" value={entry.calories} size="sm" />
          <NutriPill variant="protein" value={entry.protein} size="sm" showLabel={false} />
        </div>
      </motion.div>
    </div>
  );
}
