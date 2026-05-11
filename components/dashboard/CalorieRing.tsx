"use client";

import { useSpring, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import AnimatedNumber from "@/components/shared/AnimatedNumber";

interface CalorieRingProps {
  consumed: number;
  target: number;
}

const RADIUS = 80;
const STROKE = 12;
const NORMALIZED_RADIUS = RADIUS - STROKE / 2;
const CIRCUMFERENCE = 2 * Math.PI * NORMALIZED_RADIUS;

export default function CalorieRing({ consumed, target }: CalorieRingProps) {
  const pct = target > 0 ? consumed / target : 0;
  const clampedPct = Math.min(pct, 1);

  const springPct = useSpring(clampedPct, { stiffness: 60, damping: 15 });
  const strokeDashoffset = useTransform(springPct, (v) => CIRCUMFERENCE - v * CIRCUMFERENCE);

  const springProgress = useSpring(pct, { stiffness: 60, damping: 15 });
  const strokeColor = useTransform(springProgress, (v) => {
    if (v > 1) return "#ef4444";
    if (v >= 0.75) return "#f59e0b";
    return "#22c55e";
  });

  useEffect(() => {
    springPct.set(clampedPct);
    springProgress.set(pct);
  }, [springPct, springProgress, clampedPct, pct]);

  const remaining = target - consumed;
  const isOver = remaining < 0;
  const statusText = isOver
    ? `${Math.abs(remaining)} kcal over`
    : `${remaining} kcal remaining`;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[176px] h-[176px]"
        role="img"
        aria-label={`${consumed} calories consumed of ${target} target`}
      >
        <svg width={176} height={176} viewBox="0 0 176 176" aria-hidden="true">
          {/* Track */}
          <circle
            cx={88}
            cy={88}
            r={NORMALIZED_RADIUS}
            fill="none"
            stroke="#fbebd8"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <motion.circle
            cx={88}
            cy={88}
            r={NORMALIZED_RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 88 88)"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-black leading-none"
            style={{ color: strokeColor, letterSpacing: "-2px" }}
          >
            <AnimatedNumber value={consumed} />
          </motion.span>
          <span className="text-[11px] uppercase tracking-widest text-[#a89070] mt-1">
            / {target}
          </span>
        </div>
      </div>

      <motion.p
        className="text-xs mt-2"
        style={{ color: strokeColor }}
      >
        {statusText}
      </motion.p>
    </div>
  );
}
