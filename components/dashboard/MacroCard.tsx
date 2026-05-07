"use client";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

function MacroBar({ label, current, target, color }: MacroBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const over = current > target;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-700 uppercase tracking-widest text-[#a89070]">
          {label}
        </span>
        <span
          className={`text-xs font-700 ${over ? "text-red-500" : "text-[#3d2b0e]"}`}
        >
          {current}g / {target}g
        </span>
      </div>
      <div className="h-2.5 bg-[#fbebd8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? "#ef4444" : color,
          }}
        />
      </div>
    </div>
  );
}

interface MacroCardProps {
  protein: number;
  carbs: number;
  fat: number;
  targets: { protein: number; carbs: number; fat: number };
}

export default function MacroCard({
  protein,
  carbs,
  fat,
  targets,
}: MacroCardProps) {
  return (
    <div className="space-y-4">
      <MacroBar
        label="Protein"
        current={protein}
        target={targets.protein}
        color="#ff7c2a"
      />
      <MacroBar
        label="Carbs"
        current={carbs}
        target={targets.carbs}
        color="#ffb347"
      />
      <MacroBar
        label="Fat"
        current={fat}
        target={targets.fat}
        color="#ffd580"
      />
    </div>
  );
}
