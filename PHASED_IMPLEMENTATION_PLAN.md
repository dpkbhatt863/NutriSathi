# NutriSathi — Phased Implementation Plan

> Frontend rewrite roadmap with tasks, dependencies, complexity, and AI prompts per phase.

---

## Overview

| Phase | Name | Est. Time | Complexity |
|---|---|---|---|
| 1 | Project Setup & Foundation | 1–2 days | Low |
| 2 | Core Architecture | 2–3 days | Medium |
| 3 | Shared Components | 2–3 days | Medium |
| 4 | Pages & Features | 4–6 days | High |
| 5 | Optimization & Polish | 2–3 days | Medium |
| 6 | Testing & Deployment | 2–3 days | Medium |

**Total estimate:** 13–20 focused dev days (solo developer)

---

## Phase 1 — Project Setup & Foundation

### Goal
Clean slate: correct dependencies, config, design tokens, providers.

### Tasks

| # | Task | Complexity |
|---|---|---|
| 1.1 | Remove unused dependencies (`@anthropic-ai/sdk`) | Low |
| 1.2 | Install missing deps: `@tanstack/react-query`, `react-hook-form`, `zod`, `sonner` | Low |
| 1.3 | Install full shadcn/ui component set: `npx shadcn@latest add card input label tabs dialog tooltip skeleton progress badge` | Low |
| 1.4 | Add `lucide-react` icon imports (tree-shakeable, already installed) | Low |
| 1.5 | Set up `components/layout/Providers.tsx` with `QueryClientProvider` + `ThemeProvider` | Low |
| 1.6 | Wire `Providers` into `app/layout.tsx` | Low |
| 1.7 | Add `Toaster` (sonner) to `app/layout.tsx` | Low |
| 1.8 | Set up Tailwind dark mode: `darkMode: "class"` in config | Low |
| 1.9 | Add dark mode CSS vars to `globals.css` `.dark {}` block | Low |
| 1.10 | Set up path aliases in `tsconfig.json`: `@/components`, `@/hooks`, `@/lib` | Low |
| 1.11 | Create `config/queryClient.ts` with stale times | Low |
| 1.12 | Create `config/theme.ts` JS exports of design tokens | Low |

### Dependencies
None — start here.

### Deliverables
- Clean `package.json`
- Working `Providers` wrapper
- Dark mode CSS variables in place
- All shadcn components available

### AI Prompt
> "Set up a Next.js 15 project with TypeScript, Tailwind CSS v4, shadcn/ui, @tanstack/react-query v5, react-hook-form, zod, and framer-motion. Create a `components/layout/Providers.tsx` file that wraps children with `QueryClientProvider` (using a custom queryClient from `config/queryClient.ts`) and a `ThemeProvider` (next-themes). Add `Sonner` toaster. Wire it into `app/layout.tsx`. Keep existing Nunito font setup."

---

## Phase 2 — Core Architecture

### Goal
State management refactor, API layer, Zod schemas, custom hooks.

### Tasks

| # | Task | Complexity |
|---|---|---|
| 2.1 | Refactor `lib/store.ts` into slice pattern (5 slices in `lib/store/`) | Medium |
| 2.2 | Add `chatMessages` and `mealBuilderItems` to persisted state | Low |
| 2.3 | Add Zustand devtools middleware (dev only) | Low |
| 2.4 | Create `lib/schemas/profile.ts` (Zod, full UserProfile shape) | Low |
| 2.5 | Create `lib/schemas/foodEntry.ts` | Low |
| 2.6 | Create `lib/schemas/customFood.ts` | Low |
| 2.7 | Create `lib/api/foodSearch.ts` (typed fetch wrapper) | Low |
| 2.8 | Create `lib/api/chat.ts` (async generator for streaming) | Medium |
| 2.9 | Create `hooks/useFoodSearch.ts` (React Query `useQuery`) | Low |
| 2.10 | Create `hooks/useChatMutation.ts` (handles streaming state) | Medium |
| 2.11 | Create `hooks/useDailyReset.ts` (extracted from dashboard page) | Low |
| 2.12 | Create `hooks/useBadgeEvaluator.ts` (extracted from dashboard page) | Medium |
| 2.13 | Create `hooks/useStreakSync.ts` (extracted from store actions) | Low |
| 2.14 | Create `hooks/useRequireProfile.ts` (auth guard) | Low |
| 2.15 | Update `app/page.tsx` to be a Server Component (no localStorage access, use cookies in future) | Low |

### Dependencies
Phase 1 complete.

### Deliverables
- Modular Zustand store with slices
- Typed API layer (no raw fetch in components)
- React Query hooks ready to use
- Business logic extracted from pages into hooks
- Zod schemas for all forms

### AI Prompts

> "Refactor this Zustand store (`lib/store.ts`) into separate slice files using the `StateCreator` slice pattern. Create files: `lib/store/profileSlice.ts`, `lib/store/foodLogSlice.ts`, `lib/store/streakSlice.ts`, `lib/store/mealBuilderSlice.ts`, `lib/store/customFoodsSlice.ts`. Combine in `lib/store/index.ts` with `persist` and `devtools` middleware. Add `chatMessages` and `mealBuilderItems` to the persisted partialize list. Here is the current store: [PASTE store.ts]"

> "Create a React Query hook `hooks/useFoodSearch.ts` that calls `/api/food-search?q=<query>`. It should: be disabled when query < 2 chars, have 1-hour staleTime, use `keepPreviousData`, merge results with `customFoods` from Zustand store (custom foods first). Type everything with the existing `FoodDatabaseItem` interface."

> "Create a `hooks/useChatMutation.ts` hook that handles the streaming `/api/chat` call. It should manage: `isStreaming` boolean, `streamingText` (partial response being built), extract `<nutri_data>...</nutri_data>` from the stream when complete, and call Zustand `addMessage` for both user and assistant messages. Use async generator pattern from `lib/api/chat.ts`."

---

## Phase 3 — Shared Components

### Goal
Build the design system: all reusable components, layout shell, bottom nav.

### Tasks

| # | Task | Complexity |
|---|---|---|
| 3.1 | `components/layout/AppShell.tsx` — layout wrapper with grid | Low |
| 3.2 | `components/layout/TopBar.tsx` — logo, greeting, settings icon | Low |
| 3.3 | `components/layout/BottomNav.tsx` — mobile tab bar with active state | Low |
| 3.4 | `components/shared/EmptyState.tsx` — illustration + message + optional CTA | Low |
| 3.5 | `components/shared/NutriPill.tsx` — cal/macro badge (variants) | Low |
| 3.6 | `components/shared/AnimatedNumber.tsx` — count-up on value change | Medium |
| 3.7 | `components/shared/LoadingDots.tsx` — 3-dot streaming indicator | Low |
| 3.8 | `components/shared/ConfirmDialog.tsx` — shadcn Dialog wrapper | Low |
| 3.9 | `components/shared/SkeletonCard.tsx` — loading placeholder | Low |
| 3.10 | Wire Framer Motion `LazyMotion` + `domAnimation` in `Providers.tsx` | Low |
| 3.11 | Create animation variants file `lib/animations.ts` (shared motion configs) | Low |

### Dependencies
Phase 2 complete. shadcn components installed (Phase 1.3).

### Deliverables
- Full reusable component library
- Mobile layout shell with bottom nav
- Consistent empty/loading/error states
- Framer Motion properly configured

### AI Prompts

> "Create a `components/layout/BottomNav.tsx` component for mobile navigation. It should have 4 items: Home (house icon), AI Chat (bot icon), Search (search icon), Me (user icon). Use `usePathname` from next/navigation for active state. Active item: filled icon + primary orange color + label. Inactive: gray icon, no label. Height 56px, safe area padding for iOS. Use `motion.div` from framer-motion for the active indicator (sliding underline or background pill). Mobile only: `md:hidden`."

> "Create a `components/shared/AnimatedNumber.tsx` component that animates a number from its previous value to the new value using framer-motion's `useSpring` and `useTransform`. Props: `value: number`, `duration?: number` (default 0.6s), `format?: (n: number) => string` (default rounds to integer). It should re-trigger animation whenever `value` changes."

> "Create `lib/animations.ts` with reusable Framer Motion variants: `fadeInUp` (opacity 0→1, y 16→0), `staggerContainer` (stagger children 0.05s), `scaleIn` (scale 0.95→1, opacity 0→1), `bubbleIn` (for chat messages, different for user vs assistant side), `badgePop` (spring scale 0→1 with overshoot). Export as named constants."

---

## Phase 4 — Pages & Features

### Goal
Rebuild all pages and feature components using the new architecture.

#### 4A — Onboarding Wizard

| # | Task | Complexity |
|---|---|---|
| 4A.1 | `components/onboarding/StepIndicator.tsx` — 4 dot/step progress bar | Low |
| 4A.2 | `components/onboarding/steps/PersonalInfoStep.tsx` — RHF + Zod (name, age, gender) | Medium |
| 4A.3 | `components/onboarding/steps/BodyMetricsStep.tsx` — weight + height with live BMI | Medium |
| 4A.4 | `components/onboarding/steps/ActivityGoalStep.tsx` — card-select UI for activity + goal | Medium |
| 4A.5 | `components/onboarding/steps/TargetsPreviewStep.tsx` — animated targets reveal | Low |
| 4A.6 | `components/onboarding/SetupWizard.tsx` — step orchestrator, accumulates form data | Medium |
| 4A.7 | `app/(auth)/setup/page.tsx` — wrap SetupWizard, add metadata | Low |

#### 4B — Dashboard Summary Panel

| # | Task | Complexity |
|---|---|---|
| 4B.1 | `components/dashboard/CalorieRing.tsx` — migrate to Framer Motion spring | Medium |
| 4B.2 | `components/dashboard/MacroBar.tsx` — single macro bar with animation | Low |
| 4B.3 | `components/dashboard/MacroGrid.tsx` — 3-up grid of MacroBars | Low |
| 4B.4 | `components/dashboard/WeeklyCalendar.tsx` — 7-day dot calendar (filled/empty) | Medium |
| 4B.5 | `components/dashboard/StreakCard.tsx` — streak count + WeeklyCalendar | Low |
| 4B.6 | `components/dashboard/BadgeShelf.tsx` — horizontal scroll shelf of earned badges | Low |
| 4B.7 | `components/dashboard/SummaryPanel.tsx` — composes all above | Low |

#### 4C — Food Log

| # | Task | Complexity |
|---|---|---|
| 4C.1 | `components/dashboard/FoodLog/FoodLogEmpty.tsx` — empty state with illustration | Low |
| 4C.2 | `components/dashboard/FoodLog/FoodLogItem.tsx` — swipe-to-delete with Framer | Medium |
| 4C.3 | `components/dashboard/FoodLog/FoodLog.tsx` — list + clear button + ConfirmDialog | Low |

#### 4D — Chat Panel

| # | Task | Complexity |
|---|---|---|
| 4D.1 | `components/chat/ChatBubble.tsx` — single message with Framer entrance | Low |
| 4D.2 | `components/chat/ChatExamples.tsx` — example chips on empty state | Low |
| 4D.3 | `components/chat/ChatPanel.tsx` — message list + auto-scroll + ConfirmEntryCard | Medium |
| 4D.4 | `components/chat/ChatInput.tsx` — refactor to use `useChatMutation` hook | Medium |
| 4D.5 | `components/chat/MealBuilder.tsx` — persist state, cleanup UI | Low |
| 4D.6 | `components/chat/ConfirmEntryCard.tsx` — add animation, macro breakdown | Low |

#### 4E — Food Search Panel

| # | Task | Complexity |
|---|---|---|
| 4E.1 | `components/food/FoodSearchInput.tsx` — debounced, with clear button | Low |
| 4E.2 | `components/food/FoodCard.tsx` — result card with macros + select button | Low |
| 4E.3 | `components/food/FoodSearchResults.tsx` — list from `useFoodSearch`, loading/error | Medium |
| 4E.4 | `components/food/QuantitySelector.tsx` — gram input + live nutrition preview | Low |
| 4E.5 | `components/food/CustomFoodForm.tsx` — migrate to RHF + Zod | Medium |
| 4E.6 | `components/food/CustomFoodList.tsx` — separate from form | Low |
| 4E.7 | `components/food/FoodSearchPanel.tsx` — composes search + custom food | Low |

#### 4F — Dashboard Page

| # | Task | Complexity |
|---|---|---|
| 4F.1 | `app/(app)/dashboard/page.tsx` — thin Server Component shell | Low |
| 4F.2 | `app/(app)/dashboard/loading.tsx` — skeleton loading | Low |
| 4F.3 | `app/(app)/dashboard/error.tsx` — error boundary UI | Low |
| 4F.4 | Wire `useDailyReset`, `useBadgeEvaluator`, `useStreakSync` in dashboard client component | Medium |
| 4F.5 | Badge unlock → confetti + toast (sonner) notification | Low |

### Dependencies
Phase 3 complete. Hooks from Phase 2 ready.

### Deliverables
- Full 4-step onboarding wizard
- Animated dashboard with all panels
- Swipe-to-delete food log
- Streaming AI chat with persistence
- Food search with React Query caching
- Custom food form with RHF + Zod

### AI Prompts

> "Rewrite `components/setup/SetupForm.tsx` as a multi-step wizard `components/onboarding/SetupWizard.tsx`. There should be 4 steps: PersonalInfo (name, age, gender), BodyMetrics (weight kg, height cm), ActivityGoal (activity level + goal as card selects), TargetsPreview (shows calculated TDEE targets). Use `react-hook-form` with `zodResolver` for each step. Show a `StepIndicator` (4 dots with active highlighting). Animate step transitions with `framer-motion` `AnimatePresence` (slide left/right). On final step, call `useNutriStore().setProfile()` and `router.replace('/dashboard')`."

> "Create `components/dashboard/WeeklyCalendar.tsx`. It shows the last 7 days as circles. Filled circle with primary orange = that day has logged food. Empty circle = no log. Today is highlighted with a border. Use the `foodLog` entries from Zustand store to determine which days have logs. Props: none (reads from store). Add a framer-motion stagger animation so circles appear one-by-one on mount."

> "Rewrite `components/food/FoodSearchResults.tsx` to use the `useFoodSearch(query)` React Query hook. Show a `SkeletonCard` while `isLoading` is true. Show `EmptyState` (title='No foods found', description='Try searching for the brand or ingredient name') when results are empty and query is non-empty. Show `EmptyState` with a different message when `isError`. Otherwise map results to `FoodCard` components with Framer Motion stagger animation."

> "Migrate `components/food/CustomFoodForm.tsx` to use `react-hook-form` with `zodResolver`. The Zod schema should require: name (string, min 1), caloriesPer100g (number, min 0), proteinPer100g (optional number), carbsPer100g (optional number), fatPer100g (optional number). On submit, call `useNutriStore().addCustomFood()` with a UUID, show a success toast via sonner. Keep the existing two-tab UI (Add New / Saved N)."

---

## Phase 5 — Optimization & Polish

### Goal
Performance, accessibility, dark mode, animations, PWA.

### Tasks

| # | Task | Complexity |
|---|---|---|
| 5.1 | Audit and fix all accessibility issues (aria labels, focus rings, contrast) | Medium |
| 5.2 | Add dark mode toggle to TopBar settings | Low |
| 5.3 | Test dark mode — fix any colors not using CSS vars | Low |
| 5.4 | `next/dynamic` for MealBuilder, CustomFoodForm (lazy load) | Low |
| 5.5 | Replace all direct color values with CSS variable references | Low |
| 5.6 | Add `LazyMotion` + `domAnimation` wrapper in Providers | Low |
| 5.7 | Audit bundle: remove dead imports, check `next build --analyze` | Medium |
| 5.8 | Add `manifest.json` + icons for PWA | Low |
| 5.9 | Add `meta` viewport and `theme-color` for mobile browser chrome | Low |
| 5.10 | Add `app/(app)/dashboard/loading.tsx` skeleton | Low |
| 5.11 | Performance test with Lighthouse, fix any issues > 10 points | Medium |
| 5.12 | Add `useCallback` / `useMemo` where profiler shows unnecessary renders | Medium |

### Dependencies
Phase 4 complete.

### Deliverables
- WCAG AA accessible UI
- Working dark mode
- Lighthouse > 90 score
- PWA installable
- Bundle < 150kB gzipped

### AI Prompts

> "Audit the NutriSathi components for accessibility issues. For each component, check: (1) all interactive elements have aria-label or visible label, (2) the CalorieRing SVG has role='img' and aria-label with current values, (3) all progress bars have role='progressbar' with aria-valuenow/aria-valuemax, (4) the chat message list has role='log' and aria-live='polite', (5) icon-only buttons have aria-label. List all violations found and provide the fixed code."

> "Add dark mode support to the NutriSathi app. The globals.css already has CSS variables for light mode. Add a `.dark {}` block with dark variants: bg #1a110a, card #2a1c11, border #3d2b0e, text #fdf6ee (muted stays #a89070). Add a theme slice to Zustand (theme: 'light'|'dark'|'system', setTheme). Create a ThemeToggle button component using lucide-react Sun/Moon icons. Add it to TopBar. Apply the 'dark' class to `document.documentElement` based on theme state using a useEffect in the dashboard client component."

---

## Phase 6 — Testing & Deployment

### Goal
Confidence-level coverage, CI, Vercel deployment.

### Tasks

| # | Task | Complexity |
|---|---|---|
| 6.1 | Install Vitest + `@testing-library/react` + `@testing-library/user-event` | Low |
| 6.2 | Unit tests: `lib/nutrition.ts` (TDEE calc) | Low |
| 6.3 | Unit tests: Zod schemas (valid/invalid inputs) | Low |
| 6.4 | Unit tests: Zustand store actions (foodLogSlice, streakSlice) | Medium |
| 6.5 | Component tests: SetupWizard (complete all 4 steps) | Medium |
| 6.6 | Component tests: FoodSearch (type query, select result, log food) | Medium |
| 6.7 | Component tests: ConfirmEntryCard (confirm + dismiss) | Low |
| 6.8 | Set up GitHub Actions CI: lint + type-check + test | Low |
| 6.9 | Add `.env.example` with required variables documented | Low |
| 6.10 | Vercel deployment: set env vars, verify build | Low |
| 6.11 | Test production build locally: `npm run build && npm start` | Low |
| 6.12 | E2E smoke test: new user flow (setup → log food via AI → log food via search) | Medium |

### Dependencies
Phase 5 complete.

### Deliverables
- Vitest unit + component test suite
- GitHub Actions CI passing
- Production deployment on Vercel
- All env vars documented

### AI Prompts

> "Set up Vitest with React Testing Library for the NutriSathi Next.js app. Install: vitest, @testing-library/react, @testing-library/user-event, jsdom, @vitejs/plugin-react. Create `vitest.config.ts` with jsdom environment and path aliases matching tsconfig. Create `tests/setup.ts` with @testing-library/jest-dom matchers. Write a test file `tests/lib/nutrition.test.ts` that tests the `calculateTDEE` function for a 30-year-old male, 70kg, 175cm, moderately active, maintain goal — assert it returns ~2,535 calories."

> "Write a React Testing Library test for the FoodLog component. Mock the Zustand store with 3 food entries. Assert: (1) all 3 entries render, (2) clicking 'Clear today's log' opens a ConfirmDialog, (3) clicking Confirm in the dialog calls `clearDailyLog()` from the store, (4) clicking Cancel closes the dialog without calling clearDailyLog. Use `vi.mock('@/lib/store')` to mock the store."

---

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Architecture) ─── depends on Phase 1
    │
    ▼
Phase 3 (Shared Components) ─── depends on Phase 1 + 2
    │
    ▼
Phase 4 (Pages & Features) ─── depends on 1 + 2 + 3
    │
    ▼
Phase 5 (Optimization) ─── depends on 4
    │
    ▼
Phase 6 (Testing & Deploy) ─── depends on 5
```

## Quick-Start Checklist

Copy this to a task manager (Notion, Linear, etc.):

- [ ] Phase 1: All 12 setup tasks complete
- [ ] Phase 2: Store slices + API layer + hooks complete
- [ ] Phase 3: All shared components built + Framer Motion configured
- [ ] Phase 4A: Onboarding wizard (4 steps)
- [ ] Phase 4B: Dashboard summary panel
- [ ] Phase 4C: Food log with swipe-to-delete
- [ ] Phase 4D: AI chat with streaming + persistence
- [ ] Phase 4E: Food search with React Query
- [ ] Phase 4F: Dashboard page assembled
- [ ] Phase 5: Accessibility + dark mode + performance
- [ ] Phase 6: Tests + CI + Vercel deploy
