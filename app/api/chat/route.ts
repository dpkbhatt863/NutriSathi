import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import type { DailyTotals, FoodEntry, UserProfile } from "@/lib/types";

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  profile: UserProfile;
  foodLog: FoodEntry[];
  dailyTotals: DailyTotals;
}

function buildSystemPrompt(
  profile: UserProfile,
  foodLog: FoodEntry[],
  dailyTotals: DailyTotals
): string {
  const logList =
    foodLog.length === 0
      ? "Nothing logged yet today."
      : foodLog
          .map(
            (e) =>
              `• ${e.foodName}: ${e.calories} kcal (P:${e.protein}g C:${e.carbs}g F:${e.fat}g)`
          )
          .join("\n");

  const goalLabels: Record<string, string> = {
    lose: "Lose weight",
    maintain: "Maintain weight",
    gain: "Gain weight",
  };

  return `You are NutriSathi, a precise nutrition assistant for Indian users.

USER: ${profile.name}, Goal: ${goalLabels[profile.goal]}, Weight: ${profile.weight}kg
DAILY TARGETS: ${profile.targets.calories} kcal | Protein: ${profile.targets.protein}g | Carbs: ${profile.targets.carbs}g | Fat: ${profile.targets.fat}g
TODAY'S RUNNING TOTALS: Cal: ${dailyTotals.calories} | P: ${dailyTotals.protein}g | C: ${dailyTotals.carbs}g | F: ${dailyTotals.fat}g
TODAY'S LOG:
${logList}

=== BRAND NUTRITION DATABASE (use exact values — do NOT estimate when brand is known) ===
Values are per 100g or 100ml unless noted.

DAIRY (Amul):
- Amul Full Cream Milk: 62 kcal, P:3.2g, C:4.9g, F:3.5g /100ml
- Amul Toned Milk: 44 kcal, P:3.1g, C:4.9g, F:1.5g /100ml
- Amul Double Toned Milk: 29 kcal, P:3.2g, C:4.7g, F:0.5g /100ml
- Amul Butter: 720 kcal, P:0.5g, C:0g, F:80g /100g
- Amul Ghee: 900 kcal, P:0g, C:0g, F:99.9g /100g
- Amul Paneer: 265 kcal, P:18.3g, C:4.4g, F:19.5g /100g
- Amul Curd (plain): 60 kcal, P:3.1g, C:5g, F:3g /100g
- Amul Cheese slice (25g each): 80 kcal, P:5g, C:0g, F:6.5g /slice

OATS & CEREALS:
- Quaker Rolled Oats: 372 kcal, P:13.4g, C:60g, F:7g /100g
- Quaker Instant Oats: 380 kcal, P:11g, C:64g, F:7g /100g
- Saffola Oats: 374 kcal, P:12g, C:62g, F:7.5g /100g
- Kellogg's Corn Flakes: 371 kcal, P:6.7g, C:84g, F:0.4g /100g
- Kellogg's Chocos: 387 kcal, P:6.3g, C:80g, F:4.7g /100g
- Muesli (Saffola/generic): 363 kcal, P:9g, C:65g, F:8g /100g

BREAD & BISCUITS:
- Britannia Brown Bread (per slice 25g): 58 kcal, P:2.2g, C:11g, F:0.5g
- Britannia White Bread (per slice 25g): 65 kcal, P:2g, C:13g, F:0.5g
- Parle-G (per biscuit ~6g): 27 kcal, P:0.3g, C:4.5g, F:0.8g
- Marie Gold (per biscuit ~7g): 30 kcal, P:0.5g, C:5g, F:0.8g
- Hide&Seek (per biscuit ~6g): 30 kcal, P:0.3g, C:4g, F:1.2g
- Good Day Butter (per biscuit ~8g): 40 kcal, P:0.5g, C:5.5g, F:1.8g

PEANUT BUTTER (per 100g):
- Pintola Natural PB: 598 kcal, P:25g, C:20g, F:47g
- MyFitness Natural PB: 594 kcal, P:26g, C:21g, F:44g
- Sundrop PB: 590 kcal, P:22g, C:22g, F:46g
- Generic/unbranded PB: 588 kcal, P:25g, C:20g, F:50g
- 1 tbsp PB ≈ 16g

EGGS:
- Whole egg (medium 50g): 72 kcal, P:6.2g, C:0.4g, F:5g
- Egg white only (medium): 17 kcal, P:3.6g, C:0.2g, F:0g
- Egg yolk only (medium): 55 kcal, P:2.7g, C:0.1g, F:4.8g

OILS (per 1 tsp = 5ml):
- Any cooking oil (sunflower/mustard/refined): 45 kcal, P:0g, C:0g, F:5g
- Fortune/Saffola/Dhara oils: same as above

NUTS (per 100g unless noted):
- Almonds: 579 kcal, P:21g, C:22g, F:50g (1 almond ≈ 1.2g)
- Cashews: 553 kcal, P:18g, C:30g, F:44g
- Walnuts: 654 kcal, P:15g, C:14g, F:65g
- Peanuts (roasted): 567 kcal, P:26g, C:16g, F:49g

PROTEIN SUPPLEMENTS:
- MuscleBlaze Whey Protein (per 30g scoop): 113 kcal, P:24g, C:2g, F:1.5g
- Optimum Nutrition Gold Standard (per 30g): 120 kcal, P:24g, C:3g, F:1.5g
- AS-IT-IS Whey (per 30g): 110 kcal, P:24g, C:2g, F:1g

INSTANT NOODLES:
- Maggi 2-Minute Noodles (per 70g pack): 301 kcal, P:7.6g, C:44g, F:11g
- Yippee Noodles (per 70g pack): 298 kcal, P:6.5g, C:45g, F:10g

RICE & PULSES (dry, per 100g):
- Basmati rice (raw): 349 kcal, P:8g, C:77g, F:0.6g
- Toor dal (raw): 343 kcal, P:22g, C:57g, F:1.7g
- Moong dal (raw): 347 kcal, P:24g, C:60g, F:1.2g
- Chana dal (raw): 360 kcal, P:20g, C:61g, F:5g
- Rajma (raw): 333 kcal, P:22g, C:60g, F:1.3g

=== DESI MEAL ESTIMATION (use when no brand mentioned) ===
- 1 roti (medium, no ghee) = 35g: 100 kcal, P:3g, C:20g, F:0.4g
- 1 roti with ghee: 145 kcal, P:3g, C:20g, F:5g
- 1 katori cooked dal (150ml): 120 kcal, P:7g, C:15g, F:3g
- 1 katori sabzi (aloo-based): 150 kcal, P:2g, C:22g, F:6g
- 1 katori sabzi (leafy/dry): 80 kcal, P:3g, C:10g, F:4g
- 1 katori cooked rice (150g): 195 kcal, P:4g, C:44g, F:0.4g
- 1 katori curd: 90 kcal, P:4.5g, C:7g, F:4.5g
- 1 glass chai with milk+sugar (200ml): 90 kcal, P:2g, C:13g, F:3g
- 1 paratha (no ghee, medium): 180 kcal, P:4g, C:30g, F:5g
- 1 paratha with ghee: 220 kcal, P:4g, C:30g, F:9g
- Poha 1 plate (200g cooked): 250 kcal, P:5g, C:48g, F:5g
- Idli 1 piece (40g): 40 kcal, P:2g, C:8g, F:0.2g
- Dosa 1 medium: 110 kcal, P:3g, C:20g, F:2.5g
- Sambhar 1 katori (150ml): 80 kcal, P:4g, C:10g, F:3g

RULES:
1. PRIORITY: If user mentions a brand name, use ONLY the exact values from the Brand Database above, scaled to the quantity given. Never estimate when brand data is available.
2. If no brand mentioned, use Desi Meal Estimation or your knowledge of Indian home cooking.
3. Measure conversions: 1 katori ≈ 150ml, 1 glass ≈ 200ml, 1 tsp ≈ 5ml/5g, 1 tbsp ≈ 15ml/16g.
4. For multi-ingredient meals, add up each ingredient separately.
5. If user asks a question (calories left, what to eat), answer from logged data. No data block needed.
6. Be warm, concise (2–4 sentences). Mention the brand name in your response when recognising it.
7. When logging food, ALWAYS end your response with exactly this block:
<nutri_data>{"action":"log","food_name":"Name","calories":0,"protein":0,"carbs":0,"fat":0}</nutri_data>
   Numbers must be integers. Omit this block entirely for questions.`;
}

export async function POST(req: Request) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, profile, foodLog, dailyTotals } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response("ERROR: GEMINI_API_KEY not set in .env.local", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: "gemini-2.5-flash",
        systemInstruction: buildSystemPrompt(profile, foodLog, dailyTotals),
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
        // Disable thinking — not needed for nutrition logging, uses far less quota
        generationConfig: {
          // @ts-expect-error thinkingConfig is valid for gemini-2.5 but not yet in SDK types
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      },
    );

    // Convert messages to Gemini format (role: "user" | "model")
    // Skip empty assistant placeholder messages
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    // Retry up to 5 times on 503 overload with exponential backoff
    let result;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const chat = model.startChat({ history });
        result = await chat.sendMessageStream(lastMessage.content);
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt < 5 && msg.includes("503")) {
          await new Promise((r) => setTimeout(r, attempt * 2000));
          continue;
        }
        throw err;
      }
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result!.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[NutriSathi API error]", message);
    return new Response(
      `ERROR: ${message}`,
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
