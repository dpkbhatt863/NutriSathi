"use client";

import { motion } from "framer-motion";

const ILLUSTRATIONS: Record<string, string> = {
  food: "🥗",
  chat: "🤖",
  badge: "🏆",
  search: "🔍",
};

interface EmptyStateProps {
  illustration: "food" | "chat" | "badge" | "search";
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-2 py-10 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <span style={{ fontSize: 48, filter: "grayscale(1)", lineHeight: 1 }}>
        {ILLUSTRATIONS[illustration]}
      </span>
      <p className="text-base font-semibold text-[#3d2b0e]">{title}</p>
      {description && (
        <p className="text-sm text-[#a89070] max-w-[240px] text-center">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
