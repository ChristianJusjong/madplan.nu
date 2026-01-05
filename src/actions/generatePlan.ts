"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db"; // Use alias from tsconfig
import { addDays } from "date-fns"; // Standard date lib, need to assume installed or install it. Next.js often has it or simple dates work. Use native dates for now to reduce deps if not certain.

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function getWeeklyDeals(): Promise<string> {
    // Mock Data
    return `
    Netto Deals: Minced Beef 500g 30kr, Carrots 2kg 10kr, Eggs 10pcs 15kr, Chicken Breast 25kr.
    Rema1000 Deals: Rice 1kg 12kr, Broccoli 8kr, Tuna cans 10kr, Oatmeal 1kg 10kr.
    Bilka Deals: Salmon Fillet 125g 20kr, Spinach 400g 12kr.
  `;
}

export async function generateWeeklyPlan(userId: string) {
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
      
      OUTPUT FORMAT:
      Strict JSON only. No other text. Structure:
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
        ]
      }
    `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful nutritionist JSON generator. Ensure valid strict JSON output.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("No content received from AI");
        }

        // Parse JSON
        const planData = JSON.parse(content);

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
