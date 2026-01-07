"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db"; // Use alias from tsconfig
import { addDays } from "date-fns";
import { getWeeklyDeals } from "@/lib/deals";
import { cleanJsonResponse } from "@/lib/utils";

// Initialize Groq inside function to avoid build-time errors if env is missing
// const groq = new Groq({ ... });


import { auth } from "@clerk/nextjs/server";

import { APP_CONFIG } from "@/lib/constants";

export async function generateWeeklyPlan() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // RATE LIMITING CHECK
    // Count plans created in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentPlans = await db.mealPlan.count({
      where: {
        userId,
        createdAt: {
          gte: oneDayAgo
        }
      }
    });

    if (recentPlans >= APP_CONFIG.MAX_PLANS_PER_DAY) {
      throw new Error(`Rate limit reached: You can only generate ${APP_CONFIG.MAX_PLANS_PER_DAY} plans per day.`);
    }

    const weeklyDeals = await getWeeklyDeals();
    const prefs = (user as any).preferences || {};
    const family = (user as any).familyMembers || { adults: 1, children: 0 };
    const totalPeople = family.adults + (family.children * 0.5); // Crude estimation for scaling

    // Fetch user recipes
    const allRecipes = await db.recipe.findMany({
      where: { userId },
      select: { id: true, title: true, tags: true }
    });

    // Select random subset to avoid token limits
    const recipes = allRecipes
      .sort(() => 0.5 - Math.random())
      .slice(0, 30);

    const cookbookContext = recipes.length > 0
      ? `USER COOKBOOK (Prioritize these! Use at least 2-3 if relevant): \n${recipes.map(r => `- ${r.title} (ID: ${r.id}) [${r.tags.join(",")}]`).join("\n")}`
      : "Cookbook is empty.";

    let strategies = [];
    if (prefs.skipLunch) strategies.push("- WORK LUNCH: Do NOT plan Lunch for Monday-Friday (User eats at work). Distribute calories to Breakfast/Dinner.");
    if (prefs.leftovers) strategies.push("- LEFTOVERS: Cook double portions for Dinner. Serve the PREVIOUS night's dinner as the next day's Lunch (e.g. Mon Dinner -> Tue Lunch).");

    // Fetch recurring meals
    const recurringMeals = await db.recurringMeal.findMany({ where: { userId } });
    const recurringContext = recurringMeals.map(m =>
      `- ${m.name} (${m.calories} kcal) til ${m.type} om ${m.days.join(", ")}`
    ).join("\n");

    const prompt = `
      Du er en Michelin-kok og budget-ernæringsekspert. Lav en 7-dages madplan (3 måltider pr. dag) til en bruger med disse stats:
      - Dagligt Kaloriemål: ${user.dailyCalorieGoal} kcal PR. PERSON (Voksen)
      - Familiestørrelse: ${family.adults} Voksne, ${family.children} Børn.
      
      VIGTIGT: Brugeren har disse FASTE MÅLTIDER (Generer IKKE måltider for disse tidspunkter, men tæl deres kalorier med!):
      ${recurringContext}

      UGENS TILBUD (Maksimer brugen af disse for at spare penge):
      ${weeklyDeals}
      
      ${cookbookContext}
      
      PLANLÆGNINGSSTRATEGIER:
      ${strategies.join("\n")}
      
      INSTRUKTIONER:
      1. SPROG: Alt tekst SKAL være på DANSK.
      2. GOURMET NAVNE: Brug inspirerende, menuforklarende navne (f.eks. "Citronbagt Kylling med Quinoa" i stedet for "Kylling og Ris").
      3. BRUG KOGEBOG: Hvis du bruger en opskrift fra BRUGERENS KOGEBOG, SKAL du inkludere dens "recipeId".
      4. FAMILIE SKALERING: "meals" kalorier er pr. voksen. Men **Indkøbslisten** SKAL være skaleret til ${family.adults} Voksne + ${family.children} Børn.
      5. NUL MADSPILD: Genbrug ingredienser på tværs af ugen.
      6. MÅLEENHEDER: Brug KUN metriske enheder (g, kg, dl, l, stk).
      
      OUTPUT FORMAT:
      Streng JSON kun. Ingen markdown. Struktur:
      {"days":[{"day":"Mandag","meals":[{"type":"Morgenmad","name":"Opskrift Navn","recipeId":"VALGFRI_UUID","calories":500,"ingredients":["50g Havregryn"]}]}],"shoppingList":[{"item":"Æg","amount":"21 stk","estimatedPrice":45,"currency":"DKK"}]}
    `;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Du er en kreativ dansk gourmetkok og ernæringsekspert. Du svarer altid i gyldig streng JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse JSON with cleanup
    const cleanContent = cleanJsonResponse(content);
    let planData;
    try {
      planData = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse JSON:", cleanContent);
      throw new Error("Failed to parse AI response");
    }

    // Save to DB
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const mealPlan = await db.mealPlan.create({
      data: {
        userId: user.id,
        startDate: startDate,
        endDate: endDate,
        planData: planData,
        // Optional: Create Shopping List here too if logic permits
      },
    });

    return { success: true, mealPlanId: mealPlan.id };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return { success: false, error: "Failed to generate plan" };
  }
}


