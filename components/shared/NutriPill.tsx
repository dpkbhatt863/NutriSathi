type Variant = "calories" | "protein" | "carbs" | "fat";

const CONFIG: Record<Variant, { bg: string; color: string; label: string }> = {
  calories: { bg: "#fff3e8", color: "#ff7c2a", label: "cal" },
  protein:  { bg: "#e8f5e9", color: "#22c55e", label: "g prot" },
  carbs:    { bg: "#fff8e1", color: "#f59e0b", label: "g carbs" },
  fat:      { bg: "#fce4ec", color: "#ef4444", label: "g fat" },
};

const SIZE = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
};

interface NutriPillProps {
  variant: Variant;
  value: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function NutriPill({ variant, value, showLabel = true, size = "md" }: NutriPillProps) {
  const { bg, color, label } = CONFIG[variant];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZE[size]}`}
      style={{ backgroundColor: bg, color }}
    >
      {value}{showLabel && <>&nbsp;{label}</>}
    </span>
  );
}
