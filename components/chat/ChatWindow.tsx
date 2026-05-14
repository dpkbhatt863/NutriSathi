"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";
import ConfirmEntryCard from "./ConfirmEntryCard";
import type { PendingEntry } from "./ChatInput";

const EXAMPLE_PROMPTS = [
  "aaj breakfast mein poha khaaya",
  "2 roti, ek katori dal, chawal",
  "mom made aloo gobi, let me tell you the ingredients",
  "kitne calories bacha hai aaj?",
];

interface ChatWindowProps {
  messages: ChatMessage[];
  pendingEntry: PendingEntry | null;
  isBuildingMeal: boolean;
  onLog: () => void;
  onAddToMeal: () => void;
  onCancelPending: () => void;
  onExampleClick: (text: string) => void;
}

export default function ChatWindow({
  messages,
  pendingEntry,
  isBuildingMeal,
  onLog,
  onAddToMeal,
  onCancelPending,
  onExampleClick,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const isLoading =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingEntry]);

  if (messages.length === 0 && !pendingEntry) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-4 py-8 gap-4">
        <div className="text-5xl">🍱</div>
        <p className="text-[#a89070] text-sm text-center max-w-xs">
          Kya khaaya aaj? Hinglish mein bataiye — NutriSathi samajh lega!
        </p>
        <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => onExampleClick(p)}
              className="text-left text-sm px-4 py-2.5 rounded-xl border border-[#fbebd8] bg-white text-[#3d2b0e] hover:border-[#ff7c2a] hover:bg-[#fff3e6] transition-all duration-200"
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto min-h-0 py-4 space-y-3">
      {/* Chat bubbles */}
      <div className="px-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-[#ff7c2a] to-[#ffb347] text-white rounded-[18px_18px_4px_18px] shadow-md"
                  : "bg-white border border-[#fbebd8] text-[#3d2b0e] rounded-[18px_18px_18px_4px] shadow-sm"
              }`}
            >
              {msg.content || (
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#ff7c2a] animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation card */}
      {pendingEntry && !isLoading && (
        <ConfirmEntryCard
          entry={pendingEntry}
          isBuildingMeal={isBuildingMeal}
          onLog={onLog}
          onAddToMeal={onAddToMeal}
          onCancel={onCancelPending}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
