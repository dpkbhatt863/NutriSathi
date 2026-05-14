"use client";

import { useNutriStore } from "@/lib/store";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import MealBuilder from "@/components/chat/MealBuilder";
import FoodSearch from "@/components/food/FoodSearch";
import CustomFoodForm from "@/components/food/CustomFoodForm";
import type { DashboardState } from "@/hooks/useDashboardState";

interface ActionPanelProps {
  state: DashboardState;
}

const TABS = [
  { id: "search", label: "🔍 Search Food" },
  { id: "ai",     label: "🤖 AI Describe" },
  { id: "meal",   label: "🍱 Meal Builder" },
] as const;

export default function ActionPanel({ state }: ActionPanelProps) {
  const { chatMessages, mealBuilderItems, clearChat } = useNutriStore();
  const {
    tab, setTab,
    prefill, setPrefill,
    pendingEntry, setPendingEntry,
    showCustomForm, setShowCustomForm,
    handleLog, handleAddToMeal,
  } = state;

  return (
    <div className="flex-1 bg-white border border-[#fbebd8] rounded-[20px] shadow-[0_2px_16px_rgba(180,130,60,0.10)] flex flex-col min-h-[500px] md:min-h-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[#fbebd8]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2.5 rounded-t-xl text-sm font-700 border-b-2 transition-all ${
              tab === t.id
                ? "border-[#ff7c2a] text-[#ff7c2a]"
                : "border-transparent text-[#a89070] hover:text-[#3d2b0e]"
            }`}
          >
            {t.label}
            {t.id === "meal" && mealBuilderItems.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-[#ff7c2a] text-white rounded-full w-4 h-4 inline-flex items-center justify-center font-800 leading-none">
                {mealBuilderItems.length}
              </span>
            )}
          </button>
        ))}

        {/* Contextual actions */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          {tab === "search" && (
            <button
              onClick={() => setShowCustomForm((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-xl border border-[#fbebd8] text-[#ff7c2a] font-600 hover:bg-[#fff3e6] transition"
            >
              + Custom Food
            </button>
          )}
          {tab === "ai" && chatMessages.length > 0 && (
            <button onClick={clearChat} className="text-xs text-[#a89070] hover:text-[#ff7c2a] transition">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Search Food ── */}
      {tab === "search" && (
        <div className="flex-1 overflow-y-auto min-h-0">
          {showCustomForm ? (
            <CustomFoodForm onDone={() => setShowCustomForm(false)} />
          ) : (
            <>
              <FoodSearch onPendingEntry={setPendingEntry} />
              {pendingEntry && (
                <div className="mx-4 mb-3 p-4 bg-[#fff8f0] border border-[#fbebd8] rounded-2xl shadow-sm">
                  <p className="text-xs font-700 uppercase tracking-widest text-[#a89070] mb-2">Confirm entry</p>
                  <p className="font-800 text-[#3d2b0e] text-base mb-1">{pendingEntry.foodName}</p>
                  <div className="flex gap-4 text-sm text-[#a89070] mb-4">
                    <span className="font-700 text-[#ff7c2a]">{pendingEntry.calories} kcal</span>
                    <span>P: {pendingEntry.protein}g</span>
                    <span>C: {pendingEntry.carbs}g</span>
                    <span>F: {pendingEntry.fat}g</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleLog} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#ff7c2a] to-[#ffb347] text-white text-sm font-700 hover:opacity-90 transition">
                      Log it ✓
                    </button>
                    <button onClick={handleAddToMeal} className="flex-1 py-2 rounded-xl border border-[#fbebd8] text-[#3d2b0e] text-sm font-600 hover:border-[#ff7c2a] transition">
                      + Add to Meal
                    </button>
                    <button onClick={() => setPendingEntry(null)} className="px-4 py-2 rounded-xl border border-[#fbebd8] text-[#a89070] text-sm hover:border-red-300 hover:text-red-400 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── AI Describe ── */}
      {tab === "ai" && (
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow
            messages={chatMessages}
            pendingEntry={pendingEntry}
            isBuildingMeal={mealBuilderItems.length > 0}
            onLog={handleLog}
            onAddToMeal={handleAddToMeal}
            onCancelPending={() => setPendingEntry(null)}
            onExampleClick={(text) => setPrefill(text)}
          />
          <ChatInput
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(undefined)}
            onPendingEntry={setPendingEntry}
          />
        </div>
      )}

      {/* ── Meal Builder ── */}
      {tab === "meal" && (
        <div className="flex-1 flex flex-col min-h-0">
          {mealBuilderItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="text-4xl">🍱</div>
              <p className="text-sm text-[#a89070] max-w-xs">
                No items yet. Search a food or use AI Describe and tap <span className="font-700 text-[#ff7c2a]">+ Add to Meal</span> to build your meal here.
              </p>
            </div>
          ) : (
            <MealBuilder />
          )}
          <ChatInput
            prefill={prefill}
            onPrefillConsumed={() => setPrefill(undefined)}
            onPendingEntry={setPendingEntry}
          />
        </div>
      )}
    </div>
  );
}
