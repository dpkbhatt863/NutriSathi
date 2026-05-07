"use client";

import { useState, useRef, useEffect } from "react";
import { useNutriStore } from "@/lib/store";
import type { NutriData } from "@/lib/types";

// Re-export MealBuilderItem type from store via types alias
export type PendingEntry = {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

interface ChatInputProps {
  prefill?: string;
  onPrefillConsumed: () => void;
  onPendingEntry: (entry: PendingEntry) => void;
}

export default function ChatInput({
  prefill,
  onPrefillConsumed,
  onPendingEntry,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { profile, foodLog, dailyTotals, chatMessages, addMessage } =
    useNutriStore();

  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      onPrefillConsumed();
      inputRef.current?.focus();
    }
  }, [prefill, onPrefillConsumed]);

  // Infer loading from last message being empty assistant placeholder
  const isLoading =
    chatMessages.length > 0 &&
    chatMessages[chatMessages.length - 1].role === "assistant" &&
    chatMessages[chatMessages.length - 1].content === "";

  const sendMessage = async (text: string) => {
    if (!text.trim() || !profile || isLoading) return;

    const userMsg = { role: "user" as const, content: text.trim() };
    addMessage(userMsg);
    setInput("");

    // Add empty assistant placeholder (drives loading indicator)
    addMessage({ role: "assistant", content: "" });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          profile,
          foodLog,
          dailyTotals,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        const displayText = fullText
          .replace(/<nutri_data>[\s\S]*?<\/nutri_data>/g, "")
          .trim();

        const msgs = useNutriStore.getState().chatMessages;
        useNutriStore.setState({
          chatMessages: [
            ...msgs.slice(0, -1),
            { role: "assistant" as const, content: displayText },
          ],
        });
      }

      // Parse nutri_data and surface as pending entry (don't auto-log)
      const match = fullText.match(/<nutri_data>([\s\S]*?)<\/nutri_data>/);
      if (match) {
        try {
          const data: NutriData = JSON.parse(match[1]);
          if (data.action === "log") {
            onPendingEntry({
              foodName: data.food_name,
              calories: data.calories,
              protein: data.protein,
              carbs: data.carbs,
              fat: data.fat,
            });
          }
        } catch {
          // malformed JSON — ignore
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      const msgs = useNutriStore.getState().chatMessages;
      useNutriStore.setState({
        chatMessages: [
          ...msgs.slice(0, -1),
          { role: "assistant" as const, content: `Error: ${errorMsg}` },
        ],
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t border-[#fbebd8] bg-white rounded-b-[20px]">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What did you eat? (Hinglish works!)"
        disabled={isLoading}
        className="flex-1 px-4 py-2.5 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition disabled:opacity-50"
      />
      <button
        onClick={() => sendMessage(input)}
        disabled={isLoading || !input.trim()}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-700 text-sm shadow hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Thinking…
          </span>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}
