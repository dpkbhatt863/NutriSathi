# NutriSathi — AI Coding Prompts

> Ready-to-paste prompts for Cursor, Claude, Copilot, and other AI coding assistants.  
> Each prompt is self-contained — paste directly with any referenced code.

---

## Table of Contents

1. [Setup & Config Prompts](#1-setup--config-prompts)
2. [Architecture Prompts](#2-architecture-prompts)
3. [Component Generation Prompts](#3-component-generation-prompts)
4. [Refactoring Prompts](#4-refactoring-prompts)
5. [UI Redesign Prompts](#5-ui-redesign-prompts)
6. [API Integration Prompts](#6-api-integration-prompts)
7. [Animation Prompts](#7-animation-prompts)
8. [Mobile Responsiveness Prompts](#8-mobile-responsiveness-prompts)
9. [Form Handling Prompts](#9-form-handling-prompts)
10. [Testing Prompts](#10-testing-prompts)
11. [Accessibility Prompts](#11-accessibility-prompts)
12. [Performance Prompts](#12-performance-prompts)
13. [Dark Mode Prompts](#13-dark-mode-prompts)

---

## 1. Setup & Config Prompts

---

### [SETUP-01] Install and configure React Query

```
I'm building a Next.js 15 app (App Router) called NutriSathi — a nutrition tracking app. 
I need to add @tanstack/react-query v5 to the project.

Tasks:
1. Create `config/queryClient.ts` with a QueryClient that has these defaults:
   - staleTime: 5 minutes
   - gcTime: 30 minutes
   - retry: 2
   - refetchOnWindowFocus: false

2. Create `components/layout/Providers.tsx` as a Client Component that:
   - Wraps children with QueryClientProvider using the queryClient from step 1
   - Includes ReactQueryDevtools (only in development)
   - Also wraps with ThemeProvider from next-themes (attribute="class", defaultTheme="light")

3. Update `app/layout.tsx` to wrap children with Providers.

Use TypeScript. Import paths use @/ alias.
```

---

### [SETUP-02] Configure shadcn/ui components

```
I have a Next.js 15 project with shadcn/ui already partially set up (components.json exists).
I need to generate these shadcn components that are currently missing:

Run these commands:
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add tabs
npx shadcn@latest add dialog
npx shadcn@latest add tooltip
npx shadcn@latest add skeleton
npx shadcn@latest add progress
npx shadcn@latest add badge
npx shadcn@latest add sonner

After generating, update the color variables in components.json to match the NutriSathi 
design system:
- Primary: #ff7c2a (orange)
- Background: #fdf6ee (cream)
- Border: #fbebd8

Show me the commands to run and any config changes needed.
```

---

### [SETUP-03] Set up Zustand with devtools

```
Set up Zustand v5 with devtools middleware for development.

Current store is in `lib/store.ts` as a single file. I need to:
1. Keep all existing functionality
2. Add Zustand devtools (only in development, not production)
3. Add persist middleware (already exists, keep same config)

Show me how to combine persist + devtools middlewares in the correct order for Zustand v5.
The store name should be "nutrisathi" in devtools.
```

---

## 2. Architecture Prompts

---

### [ARCH-01] Refactor Zustand store into slices

```
I have a Zustand v5 store in `lib/store.ts` that handles everything in one file.
I need to split it into 5 slices using the StateCreator pattern.

Current store structure:
- profile: UserProfile | null + setProfile
- foodLog: FoodEntry[] + addFoodEntry + clearDailyLog
- dailyTotals: DailyTotals (calculated from foodLog)
- chatMessages: ChatMessage[] + addMessage + clearChat  
- streak: number + lastLogDate + updateStreak
- earnedBadges: BadgeId[] + addBadge
- isBuildingMeal: boolean + mealBuilderItems: MealBuilderItem[]
  + startMealBuilder + addToMeal + removeMealItem + logMeal + cancelMeal
- customFoods: FoodDatabaseItem[] + addCustomFood + removeCustomFood
- checkAndResetDay() (clears food log if new day)

Create these files:
1. `lib/store/profileSlice.ts`
2. `lib/store/foodLogSlice.ts` (includes dailyTotals calculation + checkAndResetDay)
3. `lib/store/streakSlice.ts` (includes earnedBadges + addBadge)
4. `lib/store/mealBuilderSlice.ts`
5. `lib/store/customFoodsSlice.ts`
6. `lib/store/index.ts` (combines all slices, adds persist + devtools)

In index.ts, make chatMessages and mealBuilderItems ALSO persisted (they were excluded before).
Use TypeScript. Keep all existing type imports from `lib/types.ts`.
```

---

### [ARCH-02] Create typed API layer

```
Create a typed API layer for the NutriSathi app.

File 1: `lib/api/foodSearch.ts`
- Export: `searchFoods(query: string): Promise<FoodDatabaseItem[]>`
- Fetches from `/api/food-search?q=<query>`
- Throws a typed `ApiError` class (with message + status) on non-ok response
- Returns `data.products` from the response

File 2: `lib/api/chat.ts`
- Export: `streamChat(payload: ChatPayload): AsyncGenerator<string, void, undefined>`
- payload type: `{ messages: ChatMessage[], profile: UserProfile, foodLog: FoodEntry[], dailyTotals: DailyTotals }`
- Uses async generator with yield for each decoded chunk
- Throws ApiError on non-ok response
- Uses ReadableStream API (works in Next.js client)

File 3: `lib/api/errors.ts`
- Export: `class ApiError extends Error { status: number }`

All files use TypeScript with existing types from `lib/types.ts`.
```

---

### [ARCH-03] Extract badge evaluator to custom hook

```
Extract the badge evaluation logic from `app/dashboard/page.tsx` into a custom hook.

Current logic in dashboard page (paraphrased):
- calculates calPct = dailyTotals.calories / profile.targets.calories
- calculates protein ratio
- checks foodLog.length
- checks streak value
- builds toAdd: BadgeId[] array
- filters out already-earned badges
- calls addBadge for each new badge
- calls confetti if any new badges earned

Create `hooks/useBadgeEvaluator.ts`:
- Takes no arguments (reads from Zustand store internally)
- Runs badge evaluation whenever foodLog changes
- Uses useEffect with [foodLog, dailyTotals, streak] as dependencies  
- Calls toast() from sonner when a new badge is earned (instead of just confetti)
- Still calls canvas-confetti for the animation
- Returns { newBadgesThisSession: BadgeId[] }

Import types from `lib/types.ts`. Import BADGES from `lib/types.ts`.
```

---

## 3. Component Generation Prompts

---

### [COMP-01] Generate BottomNav component

```
Create `components/layout/BottomNav.tsx` for the NutriSathi mobile navigation.

Requirements:
- 4 nav items: Home (house icon), AI Chat (bot icon), Search (search icon), Profile (user icon)
- Use lucide-react for icons
- Use Next.js `usePathname()` to determine active route:
  - / or /dashboard → Home active
  - /dashboard?tab=ai → AI Chat acti ve  (use searchParams too)
  - /dashboard?tab=search → Search active
  - /setup → Profile active
- Active state: icon color is #ff7c2a (var(--ns-primary)), label shown below icon
- Inactive state: icon color is #a89070 (var(--ns-muted)), no label
- Each item navigates using Next.js Link
- Component is `md:hidden` (mobile only)
- Height: 56px + env(safe-area-inset-bottom) padding for iOS notch
- Background: white, border-top: 1px solid #fbebd8
- Active item has a small animated indicator (framer-motion layoutId pill behind icon)
- TypeScript, "use client"
```

---

### [COMP-02] Generate WeeklyCalendar component

```
Create `components/dashboard/WeeklyCalendar.tsx` for the NutriSathi streak section.

Requirements:
- Shows the last 7 days as a row of 7 circles
- For each day: check if there are any food entries in the Zustand foodLog for that date
- Circle states:
  1. Logged (has food entries): filled orange (#ff7c2a), white checkmark inside
  2. Today (no entries yet): border orange, empty center
  3. Past (no entries): gray (#e5e7eb), empty
- Below each circle: day label (Mon, Tue, etc.) in 10px muted text
- Today's circle: slightly larger (20px vs 16px diameter)
- Row has justify-between spacing
- Animate on mount: circles appear with stagger (framer-motion)
- Reads data from Zustand store: `foodLog` and `lastLogDate`
- TypeScript, "use client"
- No external date library needed, use native Date API
```

---

### [COMP-03] Generate EmptyState component

```
Create `components/shared/EmptyState.tsx` — a reusable empty state component.

Props:
- illustration: "food" | "chat" | "badge" | "search" (renders a different emoji/SVG)
- title: string
- description?: string
- action?: React.ReactNode (optional CTA button)

Illustrations (use large emoji for now, 48px):
- food: 🥗
- chat: 🤖
- badge: 🏆
- search: 🔍

Layout:
- Centered flex column
- Emoji (48px, grayscale filter for "empty" feel)
- Title: text-base font-semibold text-[#3d2b0e]
- Description: text-sm text-[#a89070] max-w-[240px] text-center
- Action: rendered below with mt-4

Add a subtle fade-in animation (framer-motion) on mount.
TypeScript, named export.
```

---

### [COMP-04] Generate ConfirmDialog component

```
Create `components/shared/ConfirmDialog.tsx` using shadcn/ui Dialog.

Props:
- open: boolean
- onOpenChange: (open: boolean) => void
- title: string
- description: string
- confirmLabel?: string (default: "Confirm")
- cancelLabel?: string (default: "Cancel")  
- onConfirm: () => void
- variant?: "default" | "destructive" (default: "default")
  - destructive: confirm button is red

Usage example:
<ConfirmDialog
  open={showClearConfirm}
  onOpenChange={setShowClearConfirm}
  title="Clear today's log?"
  description="This will remove all 4 food entries for today. This cannot be undone."
  confirmLabel="Clear log"
  variant="destructive"
  onConfirm={handleClearLog}
/>

TypeScript, "use client".
```

---

### [COMP-05] Generate NutriPill component

```
Create `components/shared/NutriPill.tsx` — a small nutrition badge/chip.

Variants and their colors:
- calories: background #fff3e8, text #ff7c2a, label "cal"
- protein: background #e8f5e9, text #22c55e, label "g prot"
- carbs: background #fff8e1, text #f59e0b, label "g carbs"  
- fat: background #fce4ec, text #ef4444, label "g fat"

Props:
- variant: "calories" | "protein" | "carbs" | "fat"
- value: number
- showLabel?: boolean (default true)
- size?: "sm" | "md" (default "md")
  - sm: text-xs, px-1.5 py-0.5
  - md: text-sm, px-2 py-1

Renders: value + space + label, rounded-full, font-semibold
TypeScript, no "use client" needed (pure display).
```

---

### [COMP-06] Generate FoodLogItem with swipe-to-delete

```
Create `components/dashboard/FoodLog/FoodLogItem.tsx` with swipe-to-delete gesture.

Props:
- entry: FoodEntry (from lib/types.ts)
- onDelete: (id: string) => void

Layout (horizontal flex):
Left side:
  - Time (format "8:32 AM") in text-xs text-[#a89070]
  - Food name in text-sm font-semibold text-[#3d2b0e]

Right side (flex row gap-1):
  - <NutriPill variant="calories" value={entry.calories} />
  - <NutriPill variant="protein" value={entry.protein} showLabel={false} />

Swipe-to-delete (framer-motion):
- Wrap in motion.div with drag="x", dragConstraints={{ left: -80, right: 0 }}
- When drag ends and x offset < -60: show red delete background, trigger onDelete
- Behind the item (absolute positioned): red background (#ef4444) with trash icon
- Smooth spring animation back if not triggered

Height: 52px, border-bottom: 1px solid #fbebd8
TypeScript, "use client".
```

---

### [COMP-07] Generate CalorieRing with Framer Motion

```
Rewrite `components/dashboard/CalorieRing.tsx` to use Framer Motion instead of CSS transitions.

Current implementation uses:
- SVG circle with stroke-dashoffset CSS transition
- radius 80, strokeWidth 12, circumference = 2π×80 ≈ 502.65

New implementation requirements:
- Keep all existing props: consumed, target (both numbers)
- Use framer-motion `useSpring` for the stroke-dashoffset value
  - spring config: stiffness: 60, damping: 15
- Use framer-motion `useTransform` to map progress (0-1) to stroke color:
  - 0–0.74: #22c55e (green)
  - 0.75–1.0: #f59e0b (amber)
  - >1.0: #ef4444 (red)
- Center text: animated number (use AnimatedNumber component) for consumed calories
- Below center: "/ {target}" in smaller muted text
- Below ring: "{remaining} remaining" OR "{over} over" in color-matched text
- Add role="img" aria-label="X calories consumed of Y target" for accessibility
- TypeScript, "use client"
```

---

## 4. Refactoring Prompts

---

### [REFACTOR-01] Refactor ChatInput to use custom hook

```
Refactor `components/chat/ChatInput.tsx` to separate the streaming logic into a hook.

Current file has:
- Local state: isLoading, input text
- handleSend function that:
  - POSTs to /api/chat with streaming
  - Reads response stream chunk by chunk
  - Builds fullText, updates displayText (stripped of nutri_data tags)
  - Extracts <nutri_data>...</nutri_data> JSON block
  - Calls addMessage for user and assistant
  - Sets pendingEntry if nutri_data found

Step 1: Create `hooks/useChatMutation.ts` that:
- Manages: isStreaming, streamingText state
- Exposes: sendMessage(userText: string) async function
- Uses streamChat() from lib/api/chat.ts (async generator)
- Internally calls useNutriStore() for addMessage + profile + foodLog + dailyTotals
- Returns { sendMessage, isStreaming, streamingText }
- When stream completes, extracts nutri_data and returns it via callback

Step 2: Rewrite ChatInput.tsx to:
- Call useChatMutation hook
- Only manage local `input` textarea state
- Show isStreaming spinner
- Pass extracted pendingEntry up via onPendingEntry prop

Keep the Enter=send / Shift+Enter=newline keyboard behavior.
TypeScript, "use client".
```

---

### [REFACTOR-02] Refactor dashboard page to remove inline logic

```
The current `app/dashboard/page.tsx` is doing too much. It manages:
1. Tab state (search | ai)
2. Pending entry state  
3. Badge evaluation logic (useEffect with confetti)
4. Daily reset logic (useEffect calling checkAndResetDay)
5. Streak update logic (useEffect)
6. Layout composition

Refactor this file so that:
1. Badge evaluation → `useBadgeEvaluator` hook (already created)
2. Daily reset → `useDailyReset` hook (create it: calls checkAndResetDay on mount)
3. Streak update → `useStreakSync` hook (create it: calls updateStreak when foodLog changes)
4. Tab state + pending entry → `useDashboardState` hook (local state only, no store)
5. The page component itself only: renders AppShell, imports the 3 hooks, renders SummaryPanel + ActionPanel

Show me:
- The 3 new hook files
- The refactored page.tsx (should be < 40 lines)
```

---

### [REFACTOR-03] Migrate SetupForm to React Hook Form + Zod

```
Refactor `components/setup/SetupForm.tsx` to use react-hook-form with zodResolver.

Current form manages validation manually with a local `errors` object and handles 
fields: name, age, gender, weight, height, activity (5-option select), goal (radio).

Create `lib/schemas/profile.ts`:
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().int().min(10, "Min age 10").max(120, "Max age 120"),
  gender: z.enum(["male", "female"]),
  weight: z.coerce.number().min(20).max(300),
  height: z.coerce.number().min(100).max(250),
  activity: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"]),
  goal: z.enum(["lose", "maintain", "gain"]),
})
export type ProfileFormValues = z.infer<typeof profileSchema>

Then rewrite SetupForm.tsx to:
- Use useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) })
- Use shadcn FormField, FormItem, FormLabel, FormControl, FormMessage
- Remove all manual error state
- Keep existing TDEE calculation on submit (call calculateTDEE from lib/nutrition.ts)
- Keep the targets modal after calculation

Show the complete rewritten SetupForm.tsx and the new profile schema file.
```

---

## 5. UI Redesign Prompts

---

### [UI-01] Redesign setup page as multi-step wizard

```
Redesign the NutriSathi setup page as a beautiful 4-step wizard. 

Design requirements:
- Full-screen layout with cream background (#fdf6ee)
- Top: NutriSathi logo + tagline in Hinglish ("Apna nutrition track karo 🌿")
- Step indicator: 4 dots, active = orange filled, completed = orange with checkmark, future = gray
- Each step slides in from right (AnimatePresence + framer-motion x transitions)
- Step 1 "Aapke baare mein": Name + Age + Gender (male/female toggle pills)
- Step 2 "Aapka body": Weight (kg) + Height (cm) — show live BMI badge as user types
- Step 3 "Aapki lifestyle": 5 activity level cards (icon + title + description each), 
  then goal selection (3 cards: Lose weight 📉, Maintain 🎯, Gain muscle 💪)
- Step 4 "Aapke targets": Animated reveal of calculated TDEE, protein, carbs, fat
  with a "Chalein! 🚀" button
- Back/Next buttons at bottom
- Progress text: "Step 2 of 4" in muted color

Use shadcn components, lucide-react icons, Tailwind, framer-motion.
TypeScript. The wizard should call useNutriStore().setProfile() on final step submit.
```

---

### [UI-02] Redesign FoodLog with rich timeline

```
Redesign `components/dashboard/FoodLog/FoodLog.tsx` as a rich timeline-style log.

Current: simple list of food entries

New design:
- Section header: "Today's log" + total calories chip + "Clear" button (icon only, with tooltip)
- Group entries by meal time automatically:
  - 00:00-10:59 → "🌅 Morning"
  - 11:00-14:59 → "🌞 Afternoon"  
  - 15:00-17:59 → "🌆 Evening"
  - 18:00-23:59 → "🌙 Night"
- Each group: small section label, then entries below it
- Each entry (FoodLogItem): swipe-to-delete, shows time + name + calorie chip
- Empty state: EmptyState component with illustration="food" + "Nothing logged yet"
  + "Use AI Chat or Search to add food"
- Max height with overflow-y-auto on desktop
- Smooth list animations (framer-motion AnimatePresence for add/remove)

Show the refactored FoodLog.tsx with the groupBy logic and new layout.
TypeScript, "use client".
```

---

### [UI-03] Redesign MacroCard as animated progress bars

```
Redesign the macro display component with rich animated progress bars.

Currently: `components/dashboard/MacroCard.tsx` with 3 basic progress bars.

New `components/dashboard/MacroGrid.tsx`:
- 3 MacroBar cards in a responsive grid (1 col mobile, 3 col on larger screens)
- Each MacroBar card has:
  - Top row: macro name (Protein / Carbs / Fat) + icon (lucide: Zap/Wheat/Droplet) 
  - Large number: "87g" in font-bold text-2xl (consumed) + "/ 158g target" in muted
  - Animated progress bar (framer-motion, spring animation, height 8px, rounded-full)
  - Bar color: green if < 80%, orange if 80-100%, red if > 100%
  - Below bar: small text showing percentage (e.g. "55%")
  - Card has subtle hover lift (translateY -2px, shadow increase)

Also show `components/dashboard/MacroBar.tsx` as the individual bar component.
TypeScript, Tailwind, framer-motion. "use client".
```

---

## 6. API Integration Prompts

---

### [API-01] Create React Query hook for food search

```
Create `hooks/useFoodSearch.ts` using @tanstack/react-query v5.

Requirements:
- Function: useFoodSearch(query: string)
- Uses useQuery with queryKey: ["food-search", query]
- Calls searchFoods(query) from lib/api/foodSearch.ts
- Disabled when query.trim().length < 2
- staleTime: 1 hour (food data doesn't change often)
- Uses keepPreviousData to avoid flickering during typing
- Returns merged results: customFoods from Zustand that match query FIRST, 
  then API results (deduplicated by name)

Also export: useFoodSearchDebounced(rawInput: string, delay = 400)
- Uses useState + useEffect to debounce rawInput
- Calls useFoodSearch with the debounced value

Types: use FoodDatabaseItem from lib/types.ts
```

---

### [API-02] Handle streaming chat with React state

```
Create `hooks/useChatMutation.ts` to manage the streaming AI chat state.

The /api/chat endpoint returns a streaming text response. 
Somewhere in the stream there may be a <nutri_data>{"action":"log",...}</nutri_data> block.

Hook requirements:
- isStreaming: boolean (true while stream is running)
- streamingText: string (the partial response, with nutri_data tags stripped for display)
- sendMessage: async (userText: string) => Promise<NutriData | null>
  - Adds user message to Zustand store (addMessage)
  - Calls streamChat() from lib/api/chat.ts
  - Accumulates chunks, updates streamingText
  - Adds streaming assistant message to store, updating it in place as chunks arrive
  - On completion: extracts nutri_data JSON, returns parsed object or null
  - On error: shows toast error, sets isStreaming false
- error: string | null

The hook reads profile, foodLog, dailyTotals from Zustand to build the request payload.

Show the complete hook with proper TypeScript types.
```

---

### [API-03] Add error handling and retry logic

```
Improve the error handling in lib/api/chat.ts and lib/api/foodSearch.ts.

For foodSearch.ts:
- Throw ApiError with user-friendly messages:
  - 429: "Too many requests. Try again in a moment."
  - 503: "Food database temporarily unavailable."
  - default: "Could not search foods. Check your connection."
- Add AbortController support: accept optional signal parameter

For chat.ts (streaming):
- Handle the case where the stream errors mid-flight
- Detect Gemini 503 overloaded error in stream (currently handled by retry in route.ts 
  but add client-side handling too)
- If stream errors mid-response, yield what was received so far + error notice

Also create `lib/api/errors.ts`:
export class ApiError extends Error {
  constructor(public message: string, public status: number, public retryable: boolean) {}
}
export const isRetryable = (err: unknown): err is ApiError =>
  err instanceof ApiError && err.retryable

TypeScript. Show all 3 files.
```

---

## 7. Animation Prompts

---

### [ANIM-01] Create shared animation variants

```
Create `lib/animations.ts` with reusable Framer Motion variants for NutriSathi.

Include these named exports:

1. fadeInUp — opacity 0→1, y 16px→0, duration 0.3s easeOut
2. fadeInDown — opacity 0→1, y -16px→0  
3. staggerContainer — stagger children 0.05s delay
4. scaleIn — scale 0.95→1, opacity 0→1, duration 0.2s
5. slideInRight — x 40px→0, opacity 0→1 (for wizard step forward)
6. slideInLeft — x -40px→0, opacity 0→1 (for wizard step back)
7. slideOutRight — x 0→40px, opacity 1→0
8. slideOutLeft — x 0→-40px, opacity 1→0
9. chatBubbleUser — x 20px→0, opacity 0→1, scale 0.98→1 (from right)
10. chatBubbleAssistant — x -20px→0, opacity 0→1 (from left)
11. badgePop — scale 0→1, rotate -15deg→0, spring (stiffness 200, damping 10)
12. listItem — fadeInUp + stagger ready (use with custom i prop for delay)

Format: each as a Variants object from framer-motion.
Include TypeScript types. Named exports only, no default export.
```

---

### [ANIM-02] Animate the food log list

```
Add enter/exit animations to `components/dashboard/FoodLog/FoodLog.tsx` 
and `FoodLogItem.tsx` using Framer Motion AnimatePresence.

Requirements:
- When a new food entry is added: item slides down from top + fades in
- When an item is deleted (swipe or clear): item slides out to the left + fades out
- Use layoutId so other items smoothly reflow when one is deleted
- AnimatePresence must wrap the list with mode="popLayout" for smooth layout transitions
- Group separators (Morning/Afternoon/etc.) also animate in with a shorter fade
- Do NOT animate on initial page load (only on subsequent adds/removes)

Show the updated FoodLog.tsx with AnimatePresence wrapping and 
FoodLogItem.tsx with exit animation that works with swipe-to-delete.
```

---

### [ANIM-03] Animate badge unlock celebration

```
Create a badge unlock animation system for NutriSathi.

When a new badge is earned, I want:
1. The BadgeShelf component to animate the new badge in with a "pop" (scale spring)
2. A full-screen confetti burst (canvas-confetti already installed)  
3. A Sonner toast notification at the bottom: 
   "🏆 New badge: [badge emoji] [badge label]"
   with custom styling (orange background, white text)

Create:
1. `components/dashboard/BadgeShelf.tsx` — horizontal scroll shelf, 
   uses AnimatePresence so new badges pop in with badgePop variant from lib/animations.ts
   
2. `hooks/useBadgeEvaluator.ts` — evaluates badge conditions, 
   calls a celebrateBadge(badge: Badge) function that:
   - Calls addBadge in Zustand
   - Fires confetti: { particleCount: 80, spread: 70, colors: ["#ff7c2a","#ffd580","#ffb347"] }
   - Shows Sonner toast with the badge info

Show both files. TypeScript, "use client" where needed.
```

---

## 8. Mobile Responsiveness Prompts

---

### [MOBILE-01] Implement mobile-first dashboard layout

```
Redesign the NutriSathi dashboard layout to be mobile-first.

Current layout in `app/dashboard/page.tsx`:
- Two-column grid side by side on all screen sizes
- No bottom navigation on mobile
- Tabs (Search | AI) visible as a tab bar

New layout requirements:

MOBILE (< 768px):
- Single column, full width
- CalorieRing + MacroGrid stacked vertically  
- FoodLog below (collapsible, shows last 3 items by default)
- BottomNav fixed at bottom with 4 items
- The main content area is scrollable
- ActionPanel (chat/search) fills remaining height above BottomNav

TABLET (768px–1023px):
- Two-column layout: 280px left, flex-1 right
- No BottomNav (use tab bar in ActionPanel)
- Moderate padding

DESKTOP (1024px+):
- Two-column: 360px left, flex-1 right
- Side panel with CalorieRing + Macros + Streak + FoodLog scrollable
- Right panel full height with tabs

Create `components/layout/AppShell.tsx` that implements this responsive layout.
Use Tailwind responsive prefixes. Use CSS Grid with template columns.
TypeScript, "use client".
```

---

### [MOBILE-02] Add swipe gesture for tab switching

```
Add swipe-left/right gesture to switch between the AI Chat and Food Search tabs
in the ActionPanel on mobile.

Current: Two tabs rendered with shadcn Tabs component (click to switch).

Add swipe gesture:
- Wrap the tab content in a motion.div with drag="x" and dragConstraints={{ left: 0, right: 0 }}
- On dragEnd: if offset.x < -50, switch to next tab; if offset.x > 50, switch to previous tab
- Animate tab content transition: slide in from the appropriate direction
- Show a subtle tab indicator dot that moves smoothly between tabs (framer-motion layoutId)
- Prevent default scroll when horizontal drag detected

The tabs are: ["ai", "search"] (order matches left-to-right swipe).

Show the updated ActionPanel / tab content component.
TypeScript, framer-motion, "use client".
```

---

### [MOBILE-03] Fix mobile chat input experience

```
Fix the chat input in `components/chat/ChatInput.tsx` for mobile keyboards.

Issues on mobile:
1. When virtual keyboard opens, it pushes the chat input off screen
2. The textarea doesn't properly resize for multiline on mobile
3. "Send" button is too small for touch

Fixes needed:
1. Use `position: sticky; bottom: 0` with `env(keyboard-inset-height, 0px)` padding 
   to handle virtual keyboard (iOS 15+ / Android Chrome)
2. Textarea: auto-resize based on content (up to 4 lines max), then scrollable
   - Use a useEffect that sets textarea.style.height based on scrollHeight
3. Send button: min 44×44px touch target
4. Add a mic icon button next to send (placeholder for future voice input)
5. Placeholder text on mobile: shorter — "Batao kya khaaya..." 
   (desktop: "Tell me what you ate in Hindi or English...")

Show the complete updated ChatInput.tsx with these mobile fixes.
TypeScript, Tailwind, "use client".
```

---

## 9. Form Handling Prompts

---

### [FORM-01] Create Zod schemas for all forms

```
Create Zod validation schemas for all NutriSathi forms.

File: `lib/schemas/profile.ts`
- Fields: name (string, 1-50 chars), age (number int 10-120), gender (male|female),
  weight (number 20-300), height (number 100-250), 
  activity (5-option enum), goal (3-option enum)
- Custom error messages in English (simple, friendly)
- Export: profileSchema, PersonalInfoSchema (just name+age+gender), 
  BodyMetricsSchema (just weight+height), ActivityGoalSchema (activity+goal)

File: `lib/schemas/customFood.ts`
- Fields: name (string, required), caloriesPer100g (number, 0-900), 
  proteinPer100g (number optional, 0-100), carbsPer100g (number optional, 0-100),
  fatPer100g (number optional, 0-100)
- Validation: calories required and > 0, optional macros default to 0

File: `lib/schemas/quantitySelector.ts`
- Fields: grams (number, 1-2000, integer)
- Error: "Enter a quantity between 1g and 2000g"

Show all 3 files with z.infer type exports.
```

---

### [FORM-02] Build multi-step form with shared state

```
Create the SetupWizard with React Hook Form useFormContext for shared form state.

Pattern: use a parent form context that spans all 4 steps.

Step 1 (PersonalInfo): accesses name, age, gender fields
Step 2 (BodyMetrics): accesses weight, height fields
Step 3 (ActivityGoal): accesses activity, goal fields  
Step 4 (TargetsPreview): read-only, shows calculated targets

Requirements:
1. Use FormProvider at SetupWizard level with the full profileSchema
2. Each step uses useFormContext to access only its fields
3. On "Next", validate only the current step's fields using trigger(["field1","field2"])
4. Don't navigate to next step if current step has validation errors
5. Step 4 is read-only — shows `calculateTDEE(formValues)` result
6. Final submit calls useNutriStore().setProfile() with the calculated targets included

Show:
- SetupWizard.tsx (orchestrator with FormProvider)
- PersonalInfoStep.tsx (step 1)
- BodyMetricsStep.tsx (step 2)  
- ActivityGoalStep.tsx (step 3)
- TargetsPreviewStep.tsx (step 4)

TypeScript, react-hook-form, zod, shadcn Form components.
```

---

## 10. Testing Prompts

---

### [TEST-01] Unit tests for nutrition calculations

```
Write Vitest unit tests for `lib/nutrition.ts`.

The file exports: calculateTDEE(profile: UserProfile): MacroTargets

Test cases to cover:
1. Male, 25yo, 70kg, 175cm, moderately_active, maintain → ~2535 cal
2. Female, 30yo, 60kg, 165cm, lightly_active, lose → ~1650 cal  
3. Male, 40yo, 90kg, 180cm, very_active, gain → ~3400 cal
4. Female, 22yo, 55kg, 160cm, sedentary, maintain → ~1680 cal
5. Edge case: minimum age (10), minimum weight (20), minimum height (100)
6. Edge case: maximum values

For each test, verify: calories (±50 tolerance), protein (~= weight * 1.8g), 
carbs and fat are positive numbers in reasonable ranges.

Use: describe/it blocks, expect().toBeCloseTo() for floating point.
Import calculateTDEE and UserProfile type.
```

---

### [TEST-02] Component tests for FoodSearch

```
Write React Testing Library tests for `components/food/FoodSearchPanel.tsx`.

Mock setup:
- Mock `hooks/useFoodSearchDebounced` to return controllable data
- Mock `useNutriStore` to provide empty customFoods and a mock addFoodEntry

Test cases:
1. "renders search input and placeholder text"
2. "shows skeleton while loading (isLoading = true)"  
3. "shows EmptyState when query entered but no results"
4. "renders food cards when results available"
5. "clicking a food card shows QuantitySelector"
6. "entering quantity shows live nutrition preview"
7. "clicking Log button calls addFoodEntry with correct nutrition values"
8. "shows error state when useFoodSearch returns isError=true"

Use: renderWithProviders helper (wraps with QueryClientProvider + Zustand provider),
userEvent for interactions, screen.getByText / getByRole for assertions.
```

---

## 11. Accessibility Prompts

---

### [A11Y-01] Fix accessibility across all components

```
Audit and fix accessibility issues in these NutriSathi components:

1. CalorieRing SVG:
   - Add role="img"
   - Add aria-label="320 calories consumed of 2100 target, 1780 remaining"
   - Hide decorative elements with aria-hidden

2. MacroBar progress bars:
   - Add role="progressbar" to each bar
   - Add aria-valuenow={consumed} aria-valuemax={target} aria-valuemin={0}
   - Add aria-label="Protein: 87g of 158g target, 55%"

3. ChatWindow message list:
   - Wrap entire message list in <div role="log" aria-live="polite" aria-label="Chat messages">
   - Add aria-label to each message bubble: "You said: ..." or "NutriSathi responded: ..."

4. BottomNav:
   - Add role="navigation" aria-label="Main navigation"
   - Active item: aria-current="page"
   - Icon-only items: aria-label on each button

5. Streak badge:
   - "🔥" emoji: wrap in <span aria-hidden="true">, add visually hidden text "on fire"

6. All icon-only buttons (Clear log, Settings, etc.):
   - Add aria-label

Show the fixed versions of each component with the accessibility attributes added.
```

---

## 12. Performance Prompts

---

### [PERF-01] Add lazy loading for heavy components

```
Optimize the NutriSathi dashboard bundle using Next.js dynamic imports.

Identify heavy components that are only shown conditionally:
1. MealBuilder (shown only when isBuildingMeal = true)
2. CustomFoodForm (shown only when showCustomForm = true)
3. ConfirmEntryCard (shown only when pendingEntry exists)
4. RewardBadges (below the fold)

For each, use `next/dynamic` with:
- A loading skeleton (SkeletonCard component)
- ssr: false (these are purely client-side, interactive components)

Also:
- Replace `import { motion } from "framer-motion"` with LazyMotion + domAnimation 
  everywhere (reduces bundle ~20kB)
- Show the Providers.tsx update to wrap with <LazyMotion features={domAnimation}>

Show the updated dashboard page.tsx with dynamic imports and the Providers.tsx update.
```

---

### [PERF-02] Optimize React renders with memo

```
Add React.memo and useCallback/useMemo optimizations to the NutriSathi dashboard.

Profile and identify components that re-render unnecessarily:

1. FoodLogItem — memoize since it receives stable entry object:
   export default memo(FoodLogItem)
   Explain what props need stable references.

2. MacroBar — memoize with custom comparison (only re-render if value/target change):
   export default memo(MacroBar, (prev, next) => 
     prev.consumed === next.consumed && prev.target === next.target
   )

3. In dashboard page/parent component:
   - useCallback for onDelete handler passed to FoodLogItem
   - useCallback for onFoodSelect handler passed to FoodCard
   - useMemo for derived values: macroPercents, caloriePct, isOverTarget

4. In useFoodSearch hook:
   - Ensure merged results (customFoods + api results) are memoized:
     useMemo(() => mergeResults(customFoods, apiResults), [customFoods, apiResults])

Show all the updated files with memo/useCallback/useMemo applied correctly.
```

---

## 13. Dark Mode Prompts

---

### [DARK-01] Implement dark mode with CSS variables

```
Add dark mode to the NutriSathi app using CSS variables + Tailwind dark class.

Step 1: Update `app/globals.css` 
Add a `.dark {}` block with dark variants:
- --ns-bg: #1a110a
- --ns-surface: #221509
- --ns-card: #2a1c11  
- --ns-border: #3d2b0e
- --ns-text: #fdf6ee
- --ns-muted: #c4a882
(keep --ns-primary and other brand colors the same)

Step 2: Add theme slice to Zustand store
- theme: "light" | "dark" | "system" (default "light")
- setTheme: (t) => void
- Persisted in localStorage

Step 3: Create `hooks/useTheme.ts`
- Reads theme from store
- useEffect that applies "dark" class to document.documentElement
- For "system": uses window.matchMedia("(prefers-color-scheme: dark)")

Step 4: Create `components/shared/ThemeToggle.tsx`
- Single button cycling: light → dark → system → light
- Icons: Sun (light), Moon (dark), Monitor (system) from lucide-react
- Show current theme label in tooltip (shadcn Tooltip)
- 36×36px, rounded-full, subtle border

Step 5: Add ThemeToggle to TopBar (top-right corner).

Show all 5 files/changes.
```

---

### [DARK-02] Audit components for dark mode compatibility

```
Audit these NutriSathi components for dark mode compatibility.
All components use Tailwind classes. Check each for hardcoded colors that won't 
respond to the .dark class and CSS variable swap.

Components to audit:
1. CalorieRing.tsx — SVG stroke colors
2. MacroBar.tsx — progress bar colors
3. ChatBubble.tsx — message bubble backgrounds
4. FoodCard.tsx — card background
5. StreakCard.tsx / WeeklyCalendar.tsx — circle fills
6. BadgeShelf.tsx — badge backgrounds
7. BottomNav.tsx — background + border

For each component:
- List any hardcoded hex colors (e.g. #ff7c2a, #fbebd8, bg-white, text-gray-500)
- Replace with CSS variable references or Tailwind dark: variants
- Example: `bg-white` → `bg-[var(--ns-card)]`
  or: `bg-white dark:bg-[#2a1c11]`

Show a before/after diff for each component.
```

---

## Bonus Prompts

---

### [BONUS-01] Add keyboard shortcuts

```
Add keyboard shortcuts to the NutriSathi dashboard.

Shortcuts to implement:
- / → focus the food search input
- Cmd/Ctrl + K → open a command palette (search + recent foods)
- Cmd/Ctrl + Enter → send chat message (when chat input is focused)
- Tab → switch between AI and Search tabs
- Escape → close any open dialog/modal/pending entry

Create `hooks/useKeyboardShortcuts.ts`:
- useEffect with keydown listener
- Calls appropriate store actions or sets local state
- Cleans up on unmount
- Ignore shortcuts when user is typing in an input (check event.target.tagName)

Show the hook and where to call it in the dashboard.
```

---

### [BONUS-02] Add food barcode scanner (future feature)

```
Design the architecture for a barcode scanner feature in NutriSathi.

This would allow mobile users to scan a food barcode with their camera 
to look up nutrition automatically.

Create a design document (as code comments) for:
1. Component: `components/food/BarcodeScanner.tsx`
   - Uses browser's getUserMedia API to access camera
   - Uses @zxing/browser library for QR/barcode decoding
   - Overlay UI with targeting frame
   - On successful scan: call /api/food-search with barcode number
   - OpenFoodFacts API supports barcode lookup: /product/{barcode}.json

2. API route: `app/api/food-barcode/route.ts`
   - GET /api/food-barcode?code=737628064502
   - Calls https://world.openfoodfacts.org/api/v0/product/{code}.json
   - Returns FoodDatabaseItem format

3. Integration point in FoodSearchPanel:
   - Camera icon button in search bar
   - Opens BarcodeScanner in a Dialog/Sheet
   - On result: populates search with the found food

Show the architecture outline, the API route implementation, 
and the BarcodeScanner component skeleton (without the actual ZXing integration, 
just the structure and Camera permission handling).
```

---

*End of AI Frontend Prompts*
