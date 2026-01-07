"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db"; // Use alias from tsconfig
import { addDays } from "date-fns";
import { getWeeklyDeals } from "@/lib/deals";

// Initialize Groq inside function to avoid build-time errors if env is missing
// const groq = new Groq({ ... });


import { auth } from "@clerk/nextjs/server";

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

    const weeklyDeals = await getWeeklyDeals();
    const prefs = (user.preferences as any) || {};
    const family = (user.familyMembers as any) || { adults: 1, children: 0 };
    const totalPeople = family.adults + (family.children * 0.5); // Crude estimation for scaling

    // Fetch user recipes
    const recipes = await db.recipe.findMany({
      where: { userId },
      select: { id: true, title: true, tags: true }
    });

    const cookbookContext = recipes.length > 0
      ? `USER COOKBOOK (Prioritize these! Use at least 2-3 if relevant): \n${recipes.map(r => `- ${r.title} (ID: ${r.id}) [${r.tags.join(",")}]`).join("\n")}`
      : "Cookbook is empty.";

    let strategies = [];
    if (prefs.skipLunch) strategies.push("- WORK LUNCH: Do NOT plan Lunch for Monday-Friday (User eats at work). Distribute calories to Breakfast/Dinner.");
    if (prefs.leftovers) strategies.push("- LEFTOVERS: Cook double portions for Dinner. Serve the PREVIOUS night's dinner as the next day's Lunch (e.g. Mon Dinner -> Tue Lunch).");

    // Construct Prompt
    const prompt = `
      You are a Michelin-Star Budget Dietician. Create a 7-day meal plan (3 meals per day) for a user with these stats:
      - Daily Calorie Goal: ${user.dailyCalorieGoal} kcal PER PERSON (Adult)
      - Family Size: ${family.adults} Adults, ${family.children} Children.
      
      WEEKLY DEALS (Maximize usage of these to save money):
      ${weeklyDeals}
      
      ${cookbookContext}
      
      PLANNING STRATEGIES:
      ${strategies.join("\n")}
      
      INSTRUCTIONS:
      1. INSPIRATION: Use exciting, gourmet, modern recipe names.
      2. USE COOKBOOK: If you use a recipe from the USER COOKBOOK, you MUST include its "recipeId" in the meal object.
      3. FAMILY SCALING: The "meals" calories are per adult. But the **Shopping List** MUST BE SCALED for ${family.adults} Adults + ${family.children} Children.
      4. METRIC SYSTEM ONLY: Use grams (g), liters (l), pieces (pcs).
      5. ZERO FOOD WASTE: Reuse ingredients across the week.
      
      OUTPUT FORMAT:
      Strict JSON only. No markdown. Structure:
      {"days":[{"day":"Monday","meals":[{"type":"Breakfast","name":"Recipe Name","recipeId":"OPTIONAL_UUID","calories":500,"ingredients":["50g Oatmeal"]}]}],"shoppingList":[{"item":"Egg","amount":"21 pcs","estimatedPrice":45,"currency":"DKK"}]}
    `;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful nutritionist JSON generator. Ensure valid strict JSON output. Do not wrap in markdown.",
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

export function cleanJsonResponse(response: string): string {
  return response.replace(/```json/g, "").replace(/```/g, "").trim();
}
