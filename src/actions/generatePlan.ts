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

    // Construct Prompt
    const prompt = `
      You are a Budget Dietician. Create a 7-day meal plan (3 meals per day) for a user with these stats:
      - Daily Calorie Goal: ${user.dailyCalorieGoal} kcal
      - Allergies/Preferences: None (Standard)
      
      WEEKLY DEALS (Maximize usage of these to save money):
      ${weeklyDeals}
      
      INSTRUCTIONS:
      1. PRIORITIZE using ingredients from the Weekly Deals to keep costs low.
      2. Ensure the plan meets the calorie goal (+/- 100 kcal).
      3. Create a Shopping List that aggregates all ingredients.
      
      OUTPUT FORMAT:
      Strict JSON only. No markdown, no regular text. Structure:
      {
        "days": [
          {
            "day": "Monday",
            "meals": [
              {
                "type": "Breakfast",
                "name": "Recipe Name",
                "calories": 500,
                "ingredients": ["Egg", "Oatmeal"]
              }
            ]
          }
        ],
        "shoppingList": [
           { "item": "Egg", "amount": "7 pcs", "estimatedPrice": 15, "currency": "DKK" }
        ]
      }
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

function cleanJsonResponse(response: string): string {
  return response.replace(/```json/g, "").replace(/```/g, "").trim();
}
