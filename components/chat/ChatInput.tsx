"use client";

import { useState, useRef, useEffect } from "react";
import { useChatMutation } from "@/hooks/useChatMutation";
import type { PendingEntry } from "@/lib/types";

export type { PendingEntry };

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isStreaming } = useChatMutation(onPendingEntry);

  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      onPrefillConsumed();
      inputRef.current?.focus();
    }
  }, [prefill, onPrefillConsumed]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t border-[#fbebd8] bg-white rounded-b-[20px]">
      <textarea
        ref={inputRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What did you eat? (Hinglish works!)"
        disabled={isStreaming}
        className="flex-1 px-4 py-2.5 rounded-xl border border-[#fbebd8] bg-[#fdf6ee] text-[#3d2b0e] placeholder-[#a89070] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff7c2a]/40 transition disabled:opacity-50 resize-none"
      />
      <button
        onClick={handleSend}
        disabled={isStreaming || !input.trim()}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white font-700 text-sm shadow hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isStreaming ? (
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
