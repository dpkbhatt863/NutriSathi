"use client";

import { useState } from "react";
import { useNutriStore } from "@/lib/store";
import { streamChat } from "@/lib/api/chat";
import type { NutriData, PendingEntry } from "@/lib/types";

export function useChatMutation(onPendingEntry: (entry: PendingEntry) => void) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const { profile, foodLog, dailyTotals, chatMessages, addMessage } =
    useNutriStore();

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || !profile || isStreaming) return;

    const userMsg = { role: "user" as const, content: userText.trim() };
    addMessage(userMsg);
    addMessage({ role: "assistant", content: "" });

    setIsStreaming(true);
    setStreamingText("");

    let fullText = "";

    try {
      for await (const chunk of streamChat({
        messages: [...chatMessages, userMsg],
        profile,
        foodLog,
        dailyTotals,
      })) {
        fullText += chunk;
        const displayText = fullText
          .replace(/<nutri_data>[\s\S]*?<\/nutri_data>/g, "")
          .trim();
        setStreamingText(displayText);
        const msgs = useNutriStore.getState().chatMessages;
        useNutriStore.setState({
          chatMessages: [
            ...msgs.slice(0, -1),
            { role: "assistant" as const, content: displayText },
          ],
        });
      }

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
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  };

  return { sendMessage, isStreaming, streamingText };
}
