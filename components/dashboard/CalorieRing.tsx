"use client";

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export default function CalorieRing({ consumed, target }: CalorieRingProps) {
  const pct = target > 0 ? consumed / target : 0;
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const clampedPct = Math.min(pct, 1);
  const offset = circumference - clampedPct * circumference;

  const color =
    pct > 1 ? "#ef4444" : pct >= 0.75 ? "#f59e0b" : "#22c55e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[176px] h-[176px]">
        <svg width={176} height={176} viewBox="0 0 176 176">
          {/* Track */}
          <circle
            cx={88}
            cy={88}
            r={normalizedRadius}
            fill="none"
            stroke="#fbebd8"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={88}
            cy={88}
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 88 88)"
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.4s" }}
          />
          {/* Overflow arc (red) when > 100% */}
          {pct > 1 && (
            <circle
              cx={88}
              cy={88}
              r={normalizedRadius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={stroke}
              strokeDasharray={`${(pct - 1) * circumference} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform="rotate(-90 88 88)"
              style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-black leading-none tracking-tighter"
            style={{ color, letterSpacing: "-2px" }}
          >
            {consumed}
          </span>
          <span className="text-[11px] uppercase tracking-widest text-[#a89070] mt-1">
            of {target} kcal
          </span>
        </div>
      </div>
      <p className="text-xs text-[#a89070] mt-2">
        {target - consumed > 0
          ? `${target - consumed} kcal remaining`
          : `${consumed - target} kcal over goal`}
      </p>
    </div>
  );
}
