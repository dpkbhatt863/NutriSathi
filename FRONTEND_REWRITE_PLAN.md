# NutriSathi — Frontend Rewrite Plan

> Senior Frontend Architecture Document  
> Date: 2026-05-10  
> Stack: Next.js 15 · TypeScript · Tailwind CSS v4 · shadcn/ui · Zustand · React Query · React Hook Form · Zod · Framer Motion

---

## 1. Current Architecture Summary

### What Exists Today

| Layer | Technology | Status |
|---|---|---|
| Framework | Next.js 16.2.4, React 19.2.4 | ✅ Modern App Router |
| Styling | Tailwind CSS 4 + custom CSS vars | ✅ Good design tokens |
| State | Zustand 5 + localStorage persist | ✅ Works, needs structure |
| UI Components | shadcn/ui + Base UI (minimal) | ⚠️ Partially adopted |
| Forms | Custom hand-rolled validation | ❌ No schema, no library |
| API Layer | Direct fetch inside components | ❌ No abstraction |
| Auth | localStorage profile check only | ❌ No real auth |
| Animations | None (Framer Motion installed, unused) | ❌ Dead dependency |
| Error Handling | None (no error boundaries) | ❌ App can hard-crash |
| Loading States | Ad-hoc per component | ⚠️ Inconsistent |
| Accessibility | Minimal | ❌ No aria labels |
| Testing | None | ❌ Zero coverage |

### Current Flow

```
/ (page.tsx)
  → checks localStorage for profile
  → /setup   (SetupForm → TDEE calc → navigate)
  → /dashboard (CalorieRing + MacroCard + FoodLog + Chat/Search tabs)
              ├── Tab: AI Chat (ChatWindow + ChatInput → /api/chat → Gemini)
              └── Tab: Search (FoodSearch → /api/food-search → OpenFoodFacts)
```

### Persisted State Shape (Zustand)

```
nutrisathi-store (localStorage)
  ├── profile: UserProfile | null
  ├── foodLog: FoodEntry[]
  ├── dailyTotals: DailyTotals
  ├── streak: number
  ├── lastLogDate: string
  ├── earnedBadges: BadgeId[]
  ├── mealBuilderItems: MealBuilderItem[]
  └── customFoods: FoodDatabaseItem[]
```

---

## 2. Problems in Existing Frontend

### Critical

| # | Problem | Impact |
|---|---|---|
| P1 | No error boundaries — unhandled throws crash entire app | Data loss |
| P2 | API calls made directly inside component event handlers | Untestable, inconsistent loading/error UX |
| P3 | SetupForm uses manual validation with local state `errors` object | Re-invented, inconsistent |
| P4 | `app/page.tsx` uses `window.localStorage` directly — SSR-unsafe | Hydration mismatch risk |
| P5 | `chatMessages` not persisted — full chat lost on refresh | Poor UX |
| P6 | `mealBuilderItems` not persisted — in-progress meal lost on refresh | Frustrating |

### Architecture

| # | Problem | Impact |
|---|---|---|
| A1 | No custom hooks — logic lives in page/component bodies | Untestable, duplicated |
| A2 | Dashboard `page.tsx` handles badge logic, layout, tab state, badge triggers — too many concerns | Unmaintainable |
| A3 | No query/mutation abstraction — cache invalidation done by hand | Stale data risk |
| A4 | Unused deps: `@anthropic-ai/sdk`, `framer-motion`, `lucide-react` | Bundle bloat |
| A5 | Hardcoded nutrition DB inside Gemini system prompt | Prompt bloat, unmaintainable |
| A6 | No `<Suspense>` boundaries — initial hydration fully blocking | Slow perceived load |

### UX/UI

| # | Problem | Impact |
|---|---|---|
| U1 | Mobile layout stacks panels vertically with no bottom nav | Poor mobile navigation |
| U2 | No onboarding walkthrough — first-time users don't know what to do | Drop-off |
| U3 | FoodLog has no empty state illustration | Feels broken when empty |
| U4 | CalorieRing only shows today — no weekly trend visible | Low retention |
| U5 | No confirmation before clearing log (irreversible data loss) | Accidental deletion |
| U6 | Tab bar (Search | AI) not visually prominent enough on mobile | Users miss the AI feature |
| U7 | Streak badge disconnected from visual calendar | No historical context |
| U8 | Setup form is one long page — no step-by-step flow | Overwhelming for new users |

---

## 3. Recommended New Frontend Stack

```
Next.js 15                  App Router, Server Components, Streaming
TypeScript 5.x              Strict mode, path aliases
Tailwind CSS v4             Keep existing design tokens, extend
shadcn/ui                   Full component adoption (not partial)
Zustand 5                   Keep — add slice pattern, devtools
@tanstack/react-query 5     Server-state, caching, background refetch
React Hook Form 7           All forms
Zod 3                       Schema validation (shared client + server)
Framer Motion 12            Animate (already installed, just unused)
Lucide React                Icons (already installed, just unused)
canvas-confetti             Keep (badge celebrations)
```

### Why This Stack

- **React Query** handles every `/api/*` call — loading/error/stale states for free
- **React Hook Form + Zod** eliminates all manual `errors` state and validation logic
- **Framer Motion** was already paid for — just needs to be wired up
- **shadcn/ui** full adoption makes all components consistent and accessible out of the box
- **Zustand slices** separate local persistent state (profile, log, streak) from ephemeral state (UI flags, pending entries)

---

## 4. Folder Structure

```
nutrisathi-app/
├── app/
│   ├── (auth)/
│   │   └── setup/
│   │       └── page.tsx               ← onboarding wizard
│   ├── (app)/
│   │   └── dashboard/
│   │       ├── page.tsx               ← thin shell (imports layout + sections)
│   │       ├── loading.tsx            ← Suspense skeleton
│   │       └── error.tsx              ← error boundary UI
│   ├── api/
│   │   ├── chat/route.ts              ← KEEP AS IS (backend)
│   │   └── food-search/route.ts       ← KEEP AS IS (backend)
│   ├── layout.tsx                     ← root layout (font, providers)
│   ├── page.tsx                       ← redirect logic (server component)
│   └── globals.css                    ← design tokens
│
├── components/
│   ├── ui/                            ← shadcn auto-generated primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── tooltip.tsx
│   │   └── skeleton.tsx
│   │
│   ├── layout/
│   │   ├── AppShell.tsx               ← wraps dashboard, bottom nav on mobile
│   │   ├── BottomNav.tsx              ← mobile tab bar
│   │   ├── TopBar.tsx                 ← header with greeting + actions
│   │   └── Providers.tsx             ← QueryClient, ThemeProvider
│   │
│   ├── onboarding/
│   │   ├── SetupWizard.tsx            ← multi-step stepper wrapper
│   │   ├── steps/
│   │   │   ├── PersonalInfoStep.tsx
│   │   │   ├── BodyMetricsStep.tsx
│   │   │   ├── ActivityGoalStep.tsx
│   │   │   └── TargetsPreviewStep.tsx
│   │   └── StepIndicator.tsx
│   │
│   ├── dashboard/
│   │   ├── SummaryPanel.tsx           ← left panel (ring + macros + badges)
│   │   ├── CalorieRing.tsx            ← SVG ring (keep, clean up)
│   │   ├── MacroBar.tsx               ← single macro progress bar
│   │   ├── MacroGrid.tsx              ← 3-up grid of MacroBars
│   │   ├── StreakCard.tsx             ← streak + mini calendar
│   │   ├── WeeklyCalendar.tsx         ← 7-day logged dots
│   │   ├── BadgeShelf.tsx             ← earned badges row
│   │   └── FoodLog/
│   │       ├── FoodLog.tsx
│   │       ├── FoodLogItem.tsx
│   │       └── FoodLogEmpty.tsx
│   │
│   ├── chat/
│   │   ├── ChatPanel.tsx              ← container
│   │   ├── ChatBubble.tsx             ← single message bubble
│   │   ├── ChatInput.tsx              ← textarea + send (keep streaming logic)
│   │   ├── ChatExamples.tsx           ← empty state example chips
│   │   ├── MealBuilder.tsx            ← keep, minor cleanup
│   │   └── ConfirmEntryCard.tsx       ← keep, add animation
│   │
│   ├── food/
│   │   ├── FoodSearchPanel.tsx        ← container
│   │   ├── FoodSearchInput.tsx        ← debounced input
│   │   ├── FoodSearchResults.tsx      ← results list
│   │   ├── FoodCard.tsx               ← single result card
│   │   ├── QuantitySelector.tsx       ← gram input + live calc
│   │   ├── CustomFoodForm.tsx         ← keep, refactor to RHF+Zod
│   │   └── CustomFoodList.tsx         ← separate from form
│   │
│   └── shared/
│       ├── NutriPill.tsx              ← macro badge (cal/prot/carb/fat)
│       ├── EmptyState.tsx             ← reusable empty state
│       ├── LoadingDots.tsx            ← streaming indicator
│       ├── ConfirmDialog.tsx          ← confirm before destructive actions
│       └── AnimatedNumber.tsx         ← counter animation for calories
│
├── hooks/
│   ├── useNutriStore.ts               ← typed Zustand store selectors
│   ├── useDailyReset.ts               ← day-change detection effect
│   ├── useBadgeEvaluator.ts           ← badge trigger logic (extracted from dashboard)
│   ├── useFoodSearch.ts               ← React Query wrapper for /api/food-search
│   ├── useChatMutation.ts             ← React Query mutation for /api/chat
│   └── useStreakSync.ts               ← streak update logic
│
├── lib/
│   ├── store/
│   │   ├── index.ts                   ← combines slices
│   │   ├── profileSlice.ts
│   │   ├── foodLogSlice.ts
│   │   ├── streakSlice.ts
│   │   ├── mealBuilderSlice.ts
│   │   └── customFoodsSlice.ts
│   ├── api/
│   │   ├── chat.ts                    ← fetch wrapper for /api/chat
│   │   └── foodSearch.ts              ← fetch wrapper for /api/food-search
│   ├── schemas/
│   │   ├── profile.ts                 ← Zod schema for UserProfile
│   │   ├── foodEntry.ts               ← Zod schema for FoodEntry
│   │   └── customFood.ts              ← Zod schema for CustomFoodForm
│   ├── nutrition.ts                   ← KEEP (TDEE calc)
│   ├── types.ts                       ← KEEP + extend
│   └── utils.ts                       ← KEEP
│
└── config/
    ├── badges.ts                      ← badge definitions (moved from types.ts)
    ├── queryClient.ts                 ← React Query config
    └── theme.ts                       ← design token JS exports
```

---

## 5. Component Architecture

### Server vs. Client Boundary

```
app/
├── layout.tsx              [Server]  ← font, metadata
├── page.tsx                [Server]  ← redirect, no localStorage
├── (auth)/setup/page.tsx   [Server]  ← shell, metadata
└── (app)/dashboard/page.tsx [Server] ← shell, Suspense wrapper

components/layout/Providers.tsx  [Client, "use client"]  ← QueryClient boundary
components/onboarding/SetupWizard.tsx [Client]
components/dashboard/*            [Client]
components/chat/*                 [Client]
components/food/*                 [Client]
```

### Component Hierarchy (Dashboard)

```
DashboardPage (Server)
└── AppShell (Client)
    ├── TopBar
    ├── main
    │   ├── SummaryPanel
    │   │   ├── CalorieRing          ← animated SVG
    │   │   ├── MacroGrid
    │   │   │   └── MacroBar × 3
    │   │   ├── StreakCard
    │   │   │   └── WeeklyCalendar
    │   │   └── BadgeShelf
    │   │       └── BadgeIcon × n
    │   │
    │   └── ActionPanel (tabs)
    │       ├── Tab: AI Chat
    │       │   ├── ChatPanel
    │       │   │   ├── ChatBubble × n
    │       │   │   └── ConfirmEntryCard (when pending)
    │       │   ├── MealBuilder (when active)
    │       │   └── ChatInput
    │       │
    │       └── Tab: Food Search
    │           ├── FoodSearchPanel
    │           │   ├── FoodSearchInput
    │           │   └── FoodSearchResults
    │           │       └── FoodCard × n
    │           └── CustomFoodForm (toggle)
    │
    └── BottomNav (mobile only)
        ├── Home
        ├── AI Chat
        ├── Search
        └── Profile
```

---

## 6. State Management Architecture

### Split: Server State vs. Local State

```
React Query (server state)          Zustand (local/persisted state)
─────────────────────────────       ──────────────────────────────
/api/food-search results            profile
/api/chat stream                    foodLog (today)
                                    streak + lastLogDate
                                    earnedBadges
                                    mealBuilderItems
                                    customFoods
                                    chatMessages (persist now)
```

### Zustand Slice Pattern

```typescript
// lib/store/profileSlice.ts
export interface ProfileSlice {
  profile: UserProfile | null
  setProfile: (p: UserProfile) => void
  clearProfile: () => void
}

export const createProfileSlice: StateCreator<ProfileSlice> = (set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
})
```

```typescript
// lib/store/index.ts
export const useNutriStore = create<AllSlices>()(
  devtools(
    persist(
      (...a) => ({
        ...createProfileSlice(...a),
        ...createFoodLogSlice(...a),
        ...createStreakSlice(...a),
        ...createMealBuilderSlice(...a),
        ...createCustomFoodsSlice(...a),
      }),
      {
        name: "nutrisathi-store",
        partialize: (s) => ({
          profile: s.profile,
          foodLog: s.foodLog,
          dailyTotals: s.dailyTotals,
          streak: s.streak,
          lastLogDate: s.lastLogDate,
          earnedBadges: s.earnedBadges,
          customFoods: s.customFoods,
          chatMessages: s.chatMessages,   // NOW persisted
          mealBuilderItems: s.mealBuilderItems, // NOW persisted
        }),
      }
    )
  )
)
```

### React Query Setup

```typescript
// config/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      gcTime: 1000 * 60 * 30,     // 30 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})
```

```typescript
// hooks/useFoodSearch.ts
export function useFoodSearch(query: string) {
  return useQuery({
    queryKey: ["food-search", query],
    queryFn: () => searchFoods(query),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 60,  // 1 hour (food data rarely changes)
    placeholderData: keepPreviousData,
  })
}
```

---

## 7. API Layer Structure

```typescript
// lib/api/foodSearch.ts
export async function searchFoods(query: string): Promise<FoodDatabaseItem[]> {
  const res = await fetch(`/api/food-search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new ApiError("Food search failed", res.status)
  const data = await res.json()
  return data.products
}

// lib/api/chat.ts
export async function* streamChatMessage(payload: ChatPayload): AsyncGenerator<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new ApiError("Chat failed", res.status)
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield decoder.decode(value, { stream: true })
  }
}
```

---

## 8. Authentication Flow

> Current: no auth. Rewrite plan: localStorage profile gate (no change in backend).

```
User visits /
  └── Server Component checks cookies/session (future: NextAuth.js)
      └── No session → redirect /setup
          └── SetupWizard (4 steps)
              ├── Step 1: Name + Age + Gender
              ├── Step 2: Weight + Height
              ├── Step 3: Activity + Goal
              └── Step 4: Targets preview → "Let's go!" → /dashboard
  └── Has session → redirect /dashboard

Future auth: NextAuth.js with:
  - Google OAuth (for Indian users)
  - Email/password (OTP via email)
  - Profile stored in DB instead of localStorage
```

### Profile Guard Hook

```typescript
// hooks/useNutriStore.ts
export function useRequireProfile() {
  const profile = useNutriStore((s) => s.profile)
  const router = useRouter()
  useEffect(() => {
    if (!profile) router.replace("/setup")
  }, [profile, router])
  return profile
}
```

---

## 9. Responsive / Mobile-First Strategy

### Breakpoints (Tailwind default)

| Name | Width | Layout |
|---|---|---|
| base (mobile) | < 768px | Single column, bottom nav |
| md (tablet) | 768–1023px | Two column, no bottom nav |
| lg (desktop) | 1024px+ | Two column wider panels |

### Mobile Layout

```
┌──────────────────────────┐
│  TopBar (logo + streak)  │
├──────────────────────────┤
│                          │
│  CalorieRing (centered)  │
│  MacroGrid (3 bars)      │
│  BadgeShelf (scroll h)   │
│                          │
├──────────────────────────┤
│  Tab content (AI/Search) │
│  (swipeable, full width) │
│                          │
│                          │
│                          │
├──────────────────────────┤
│  BottomNav               │
│  [Home] [AI] [Search] [Me]│
└──────────────────────────┘
```

### Desktop Layout

```
┌─────────────────────────────────────────────────┐
│  TopBar                                         │
├─────────────────┬───────────────────────────────┤
│                 │                               │
│  SummaryPanel   │  ActionPanel (tab bar)         │
│  (w-80 lg:w-96) │  [AI Chat] [Food Search]       │
│  CalorieRing    │                               │
│  MacroGrid      │  Chat or Search content       │
│  StreakCard     │  (flex-1, scrollable)         │
│  BadgeShelf     │                               │
│  FoodLog        │                               │
│                 │                               │
└─────────────────┴───────────────────────────────┘
```

### Touch Targets

- All tap targets: min 44×44px
- Bottom nav items: 56px tall
- Food log items: swipe-to-delete (Framer Motion drag)

---

## 10. UI Design System

### Color Palette (Extended from Existing)

```css
/* Core (keep existing) */
--ns-primary:      #ff7c2a   /* Orange */
--ns-secondary:    #ffb347   /* Soft orange */
--ns-accent:       #ffd580   /* Gold */
--ns-bg:           #fdf6ee   /* Cream */
--ns-card:         #ffffff
--ns-border:       #fbebd8
--ns-text:         #3d2b0e   /* Dark brown */
--ns-muted:        #a89070   /* Tan */

/* New additions */
--ns-surface:      #fff9f3   /* Slightly warmer than white for nested cards */
--ns-success:      #22c55e
--ns-warning:      #f59e0b
--ns-error:        #ef4444
--ns-info:         #3b82f6

/* Dark mode (new) */
--ns-bg-dark:      #1a110a
--ns-card-dark:    #2a1c11
--ns-border-dark:  #3d2b0e
--ns-text-dark:    #fdf6ee
--ns-muted-dark:   #a89070
```

### Typography System

```css
/* Font: Nunito (keep) */
--font-display: "Nunito", sans-serif;

/* Scale (using Tailwind classes) */
display:   text-3xl font-black    (32px, 900)   ← calorie numbers, splash
heading:   text-xl font-bold      (20px, 700)   ← section titles
subhead:   text-base font-semibold(16px, 600)   ← card titles
body:      text-sm font-normal    (14px, 400)   ← content text
label:     text-xs font-semibold  (12px, 600)   ← macro labels, tags
micro:     text-xs font-normal    (12px, 400)   ← timestamps, secondary
```

### Spacing System

```
4px   (space-1)  → icon gaps, tight labels
8px   (space-2)  → within card elements
12px  (space-3)  → between related items
16px  (space-4)  → card padding, section gaps
24px  (space-6)  → between cards
32px  (space-8)  → section vertical margin
48px  (space-12) → page vertical padding
```

### Shadow Scale

```css
--shadow-sm:  0 1px 3px rgba(61,43,14,0.08);   ← card default
--shadow-md:  0 4px 12px rgba(61,43,14,0.12);  ← elevated card
--shadow-lg:  0 8px 24px rgba(61,43,14,0.16);  ← modal, tooltip
```

### Border Radius

```
rounded-lg     (8px)   → inputs, tags
rounded-xl     (12px)  → cards
rounded-2xl    (16px)  → panels
rounded-3xl    (24px)  → modals
rounded-full          → avatars, badges
```

---

## 11. Reusable Component Strategy

### Pattern: Compound Components for Complex UI

```tsx
// Usage:
<FoodCard>
  <FoodCard.Header name="Amul Paneer" brand="Amul" />
  <FoodCard.Macros calories={265} protein={18} carbs={3} fat={20} />
  <FoodCard.Actions onSelect={handleSelect} />
</FoodCard>
```

### Pattern: Polymorphic `as` Prop for Semantic HTML

```tsx
// NutriPill can render as <span>, <button>, or <div>
<NutriPill as="button" variant="calories" value={320} onClick={...} />
<NutriPill as="span" variant="protein" value={24} />
```

### Pattern: Controlled + Uncontrolled Variants

All interactive components support both:
```tsx
// Controlled
<QuantitySelector value={grams} onChange={setGrams} />

// Uncontrolled (with RHF)
<QuantitySelector {...register("grams")} />
```

### Shared Components Checklist

| Component | Description | Props |
|---|---|---|
| `EmptyState` | Illustration + message | `title`, `description`, `action?` |
| `LoadingDots` | 3-dot animated indicator | `size`, `color` |
| `ConfirmDialog` | Confirm destructive action | `title`, `description`, `onConfirm` |
| `AnimatedNumber` | Count-up on value change | `value`, `duration`, `format` |
| `NutriPill` | Cal/protein/carb/fat badge | `variant`, `value`, `unit?` |
| `SkeletonCard` | Loading placeholder | `height`, `lines?` |

---

## 12. Form Handling Strategy

### Zod Schemas (shared)

```typescript
// lib/schemas/profile.ts
export const profileSchema = z.object({
  name: z.string().min(1, "Name required").max(50),
  age: z.number().int().min(10).max(120),
  gender: z.enum(["male", "female"]),
  weight: z.number().min(20).max(300),
  height: z.number().min(100).max(250),
  activity: z.enum(["sedentary","lightly_active","moderately_active","very_active","extra_active"]),
  goal: z.enum(["lose","maintain","gain"]),
})
export type ProfileFormValues = z.infer<typeof profileSchema>
```

### React Hook Form Pattern

```typescript
// components/onboarding/steps/PersonalInfoStep.tsx
const form = useForm<PersonalInfoValues>({
  resolver: zodResolver(personalInfoSchema),
  defaultValues: { name: "", age: 25, gender: "male" },
})

return (
  <Form {...form}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your name</FormLabel>
          <FormControl><Input placeholder="e.g. Arjun" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </Form>
)
```

### Multi-Step Wizard State

```typescript
// Stored in React state (not Zustand — ephemeral)
const [step, setStep] = useState(0)
const [formData, setFormData] = useState<Partial<ProfileFormValues>>({})

// Each step receives partial data and calls onComplete
<PersonalInfoStep
  defaultValues={formData}
  onComplete={(data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(1)
  }}
/>
```

---

## 13. Error / Loading Handling

### Error Boundary (route-level)

```tsx
// app/(app)/dashboard/error.tsx
"use client"
export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-ns-error font-semibold">Something went wrong</p>
      <p className="text-ns-muted text-sm">{error.message}</p>
      <button onClick={reset} className="ns-gradient-btn">Try again</button>
    </div>
  )
}
```

### Suspense Skeletons

```tsx
// app/(app)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="grid md:grid-cols-[320px_1fr] gap-6 p-6">
        <SkeletonCard height={480} />
        <SkeletonCard height={480} />
      </div>
    </AppShell>
  )
}
```

### React Query Error States

```tsx
const { data, isLoading, isError, error } = useFoodSearch(query)

if (isError) return <EmptyState
  title="Search unavailable"
  description="Could not reach food database. Check your connection."
  action={<button onClick={() => refetch()}>Retry</button>}
/>
```

### Toast Notifications

Use shadcn `Sonner` for:
- Badge unlocked: "🔥 New badge earned!"
- Food logged: "✅ Logged 320 cal"
- Error: "❌ Failed to log — try again"
- Streak: "You're on a 7-day streak! 💎"

---

## 14. Performance Optimization Plan

### Code Splitting

```typescript
// Lazy load heavy panels
const MealBuilder = dynamic(() => import("@/components/chat/MealBuilder"), {
  loading: () => <SkeletonCard height={200} />,
})
const CustomFoodForm = dynamic(() => import("@/components/food/CustomFoodForm"), {
  loading: () => <SkeletonCard height={300} />,
})
```

### Image Optimization

- Convert all SVG icons to Lucide React (tree-shakeable)
- Use `next/image` for any raster images
- Inline critical SVGs (CalorieRing)

### Bundle Optimization

- Remove unused: `@anthropic-ai/sdk` (9.4 kB gzipped)
- Keep framer-motion but use `LazyMotion` + `domAnimation`

```typescript
import { LazyMotion, domAnimation } from "framer-motion"
// Reduces bundle by ~50% vs full import
```

### Memo Strategy

```typescript
// Memoize expensive calculations
const macroPercents = useMemo(() => ({
  protein: (dailyTotals.protein / targets.protein) * 100,
  carbs: (dailyTotals.carbs / targets.carbs) * 100,
  fat: (dailyTotals.fat / targets.fat) * 100,
}), [dailyTotals, targets])

// Stable callbacks
const handleFoodSelect = useCallback((item: FoodDatabaseItem) => {
  setPendingEntry(item)
}, [])
```

### CalorieRing SVG

- Already uses CSS transition on `stroke-dashoffset` — performant
- Avoid recalculating on every render with `useMemo`

---

## 15. Accessibility Checklist

- [ ] All form inputs have `<label>` or `aria-label`
- [ ] CalorieRing has `role="img"` + `aria-label="N calories consumed of T target"`
- [ ] Progress bars: `role="progressbar"` + `aria-valuenow` + `aria-valuemax`
- [ ] Chat messages: `role="log"` + `aria-live="polite"` on the container
- [ ] Icon-only buttons: `aria-label` describing the action
- [ ] BottomNav: `role="navigation"` + `aria-label="Main"`
- [ ] Focus ring visible for keyboard users (add `:focus-visible` styles)
- [ ] Color contrast: all text meets WCAG AA (4.5:1)
- [ ] Streak badge emoji: wrapped in `aria-hidden`, text alternative provided
- [ ] Dialogs trap focus correctly (shadcn Dialog handles this)

---

## 16. Dark / Light Theme Structure

### CSS Variables Approach

```css
/* globals.css */
:root {
  --ns-bg:     #fdf6ee;
  --ns-card:   #ffffff;
  --ns-text:   #3d2b0e;
  --ns-muted:  #a89070;
  --ns-border: #fbebd8;
}

.dark {
  --ns-bg:     #1a110a;
  --ns-card:   #2a1c11;
  --ns-text:   #fdf6ee;
  --ns-muted:  #a89070;
  --ns-border: #3d2b0e;
}
```

### Theme Toggle

```typescript
// Zustand UI slice
interface UISlice {
  theme: "light" | "dark" | "system"
  setTheme: (t: UISlice["theme"]) => void
}
```

```tsx
// Apply theme via class on <html>
useEffect(() => {
  const root = document.documentElement
  if (theme === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
}, [theme])
```

> **Note:** All existing Tailwind classes already use design tokens (not hardcoded colors), so adding dark mode is a CSS variable swap — no class-by-class changes needed.

---

## 17. Animation Strategy

> Framer Motion is already installed (v12.38.0). Wire it up:

### Entry Animations (Page Load)

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" }
  }),
}

// Staggered dashboard cards
{cards.map((card, i) => (
  <motion.div key={card.id} custom={i} variants={cardVariants}
    initial="hidden" animate="visible">
    {card.content}
  </motion.div>
))}
```

### CalorieRing Progress (Existing CSS → Framer)

```tsx
// Animate ring progress with spring physics
<motion.circle
  strokeDashoffset={circumference - (circumference * pct) / 100}
  transition={{ type: "spring", stiffness: 60, damping: 15 }}
/>
```

### Chat Bubble Entrance

```tsx
const bubbleVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
}
<motion.div variants={bubbleVariants} initial="hidden" animate="visible">
  <ChatBubble message={msg} />
</motion.div>
```

### Badge Pop Animation

```tsx
<motion.div
  initial={{ scale: 0, rotate: -15 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 200, damping: 10 }}
>
  <BadgeIcon />
</motion.div>
```

### Food Log Item (Swipe to Delete)

```tsx
<motion.div
  drag="x"
  dragConstraints={{ right: 0 }}
  onDragEnd={(_, { offset }) => {
    if (offset.x < -100) onDelete()
  }}
>
  <FoodLogItem entry={entry} />
</motion.div>
```

---

## 18. UI/UX Redesign Strategy

### User Flow Improvements

**Current:** `/` → check localStorage → `/setup` or `/dashboard`  
**New:** `/` → check localStorage → animated splash → `/setup` (wizard) or `/dashboard`

**Current setup:** One long form  
**New setup:** 4-step wizard with progress indicator, 1 concept per step

**Current dashboard:** Two panels, tabs in right panel  
**New dashboard:** Mobile-first with bottom nav; desktop keeps two-panel layout

### Screen-by-Screen Redesign

#### Onboarding (SetupWizard)

```
Step 1 — "Tell us about you"
  [Name input] [Age input]
  [Gender toggle: Male / Female]
  
  Progress: ●●○○   [Next →]

Step 2 — "Your body"
  [Weight (kg) slider + input]
  [Height (cm) slider + input]
  
  Progress: ●●●○   [← Back] [Next →]

Step 3 — "Your lifestyle"
  [Activity level cards (5 options with icons)]
  [Goal: Lose / Maintain / Gain (card select)]
  
  Progress: ●●●●   [← Back] [Calculate →]

Step 4 — "Your targets"
  ┌──────────────────────────────┐
  │  🎯 Your daily targets       │
  │  2,100 calories              │
  │  Protein  158g               │
  │  Carbs    263g               │
  │  Fat      58g                │
  └──────────────────────────────┘
  [Let's go! →]
```

#### Dashboard (Redesigned)

```
TopBar:
  [🌿 NutriSathi]    [Good morning, Arjun 👋]    [⚙️]

SummaryPanel:
  ┌─────────────────────┐
  │   🔥 5 day streak   │  ← StreakCard with mini calendar
  │  ○ ○ ● ● ● ● ●     │
  └─────────────────────┘
  ┌─────────────────────┐
  │    CalorieRing      │
  │   [1,240 / 2,100]   │
  │   860 remaining     │
  └─────────────────────┘
  ┌─────────────────────┐
  │ Protein ██████░ 78% │
  │ Carbs   █████░░ 65% │
  │ Fat     ████░░░ 54% │
  └─────────────────────┘

FoodLog (collapsible on mobile):
  ┌─────────────────────────────────────────────┐
  │ Today's log (4 items)              [Clear]  │
  │ ─────────────────────────────────────────── │
  │ 🌅 8:32  Poha             320 cal  ← swipe │
  │ ☕ 9:00  Chai              45 cal  ← swipe │
  │ 🌞 1:15  Dal + 2 Roti    520 cal  ← swipe │
  │ 🍎 4:00  Apple             95 cal  ← swipe │
  └─────────────────────────────────────────────┘
```

### Navigation Redesign

**Mobile Bottom Nav:**
```
┌─────────────────────────────────────────┐
│  [🏠 Home] [🤖 AI Chat] [🔍 Search] [👤 Me]│
└─────────────────────────────────────────┘
```

**Desktop Tab Bar (in ActionPanel):**
```
[🤖 Ask AI]    [🔍 Find Food]
```

### Better Onboarding

1. **Splash Screen** (500ms): Logo animation on first visit
2. **Step progress bar** visible at all times
3. **Live TDEE preview** updates as user changes inputs in Step 2/3
4. **"Why we ask"** tooltip on each field
5. **Goal illustrations** (lose/maintain/gain visual cards)

### Badge & Streak Improvements

- **Weekly calendar dots** in StreakCard (7 circles, filled = logged)
- **Badge notification** popover (not just confetti)
- **Badge detail drawer** — tap badge to see requirements

---

## 19. Deployment Structure

### Environment Variables

```bash
# .env.local (server-only)
GEMINI_API_KEY=...          # Already server-side in /api/chat
NEXT_PUBLIC_APP_URL=...     # For OG metadata

# Future
NEXTAUTH_SECRET=...
DATABASE_URL=...
```

### Vercel (Recommended)

```
nutrisathi-app/
├── vercel.json (optional)
└── .env.production  ← set in Vercel dashboard, not committed
```

### Performance Budget

| Metric | Target |
|---|---|
| FCP | < 1.2s |
| LCP | < 2.5s |
| TTI | < 3.5s |
| Total JS | < 150kB gzipped |
| Lighthouse | > 90 (all categories) |

### Build Optimization

```typescript
// next.config.ts
const config: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  images: { formats: ["image/avif", "image/webp"] },
}
```
