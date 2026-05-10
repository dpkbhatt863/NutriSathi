import { NextRequest } from "next/server";
import type { FoodDatabaseItem } from "@/lib/types";

interface OFFProduct {
  id?: string;
  _id?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kcal"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return Response.json({ products: [] });
  }

  try {
    const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "20");
    url.searchParams.set(
      "fields",
      "id,_id,product_name,product_name_en,brands,nutriments,serving_size"
    );
    // Prefer results relevant to India
    url.searchParams.set("tagtype_0", "countries");
    url.searchParams.set("tag_contains_0", "contains");
    url.searchParams.set("tag_0", "india");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "NutriSathi/1.0 (nutrisathi@example.com)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`OFF API ${res.status}`);

    const data = await res.json();
    const rawProducts: OFFProduct[] = data.products ?? [];

    const products: FoodDatabaseItem[] = rawProducts
      .filter((p) => {
        const n = p.nutriments;
        return n && (n["energy-kcal_100g"] ?? 0) > 0;
      })
      .slice(0, 15)
      .map((p) => {
        const n = p.nutriments!;
        const name =
          (p.product_name_en || p.product_name || "Unknown product").trim();
        const brand = p.brands
          ?.split(",")[0]
          ?.trim();

        return {
          id: p.id || p._id || crypto.randomUUID(),
          name,
          brand: brand || undefined,
          caloriesPer100g: Math.round(n["energy-kcal_100g"] ?? 0),
          proteinPer100g:
            Math.round((n.proteins_100g ?? 0) * 10) / 10,
          carbsPer100g:
            Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
          fatPer100g:
            Math.round((n.fat_100g ?? 0) * 10) / 10,
        };
      });

    // If India-filtered results are too few, fall back to global search
    if (products.length < 3) {
      const url2 = new URL("https://world.openfoodfacts.org/cgi/search.pl");
      url2.searchParams.set("search_terms", query);
      url2.searchParams.set("search_simple", "1");
      url2.searchParams.set("action", "process");
      url2.searchParams.set("json", "1");
      url2.searchParams.set("page_size", "20");
      url2.searchParams.set(
        "fields",
        "id,_id,product_name,product_name_en,brands,nutriments,serving_size"
      );

      const res2 = await fetch(url2.toString(), {
        headers: { "User-Agent": "NutriSathi/1.0 (nutrisathi@example.com)" },
        next: { revalidate: 3600 },
      });

      if (res2.ok) {
        const data2 = await res2.json();
        const more: FoodDatabaseItem[] = (data2.products ?? [])
          .filter((p: OFFProduct) => (p.nutriments?.["energy-kcal_100g"] ?? 0) > 0)
          .slice(0, 15)
          .map((p: OFFProduct) => ({
            id: p.id || p._id || crypto.randomUUID(),
            name: (p.product_name_en || p.product_name || "Unknown").trim(),
            brand: p.brands?.split(",")[0]?.trim() || undefined,
            caloriesPer100g: Math.round(p.nutriments!["energy-kcal_100g"] ?? 0),
            proteinPer100g: Math.round((p.nutriments!.proteins_100g ?? 0) * 10) / 10,
            carbsPer100g: Math.round((p.nutriments!.carbohydrates_100g ?? 0) * 10) / 10,
            fatPer100g: Math.round((p.nutriments!.fat_100g ?? 0) * 10) / 10,
          }));

        // Merge, deduplicate by id
        const seen = new Set(products.map((p) => p.id));
        for (const p of more) {
          if (!seen.has(p.id)) {
            products.push(p);
            seen.add(p.id);
          }
        }
      }
    }

    return Response.json({ products: products.slice(0, 15) });
  } catch (err) {
    console.error("[food-search error]", err);
    return Response.json({ products: [], error: "Search failed" });
  }
}
