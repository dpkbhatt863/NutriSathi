import type { ChatMessage, UserProfile, FoodEntry, DailyTotals } from "@/lib/types";

interface StreamChatParams {
  messages: ChatMessage[];
  profile: UserProfile;
  foodLog: FoodEntry[];
  dailyTotals: DailyTotals;
}

export async function* streamChat({
  messages,
  profile,
  foodLog,
  dailyTotals,
}: StreamChatParams): AsyncGenerator<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, profile, foodLog, dailyTotals }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `HTTP ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
