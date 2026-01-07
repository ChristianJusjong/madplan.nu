"use server";

import { Groq } from "groq-sdk";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cleanJsonResponse } from "./generatePlan";

export async function regenerateMeal(planId: string, dayIndex: number, mealIndex: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const mealPlan = await db.mealPlan.findUnique({
        where: { id: planId, userId },
    });

    if (!mealPlan) throw new Error("Plan not found");

    const planData = mealPlan.planData as any;
    const targetDay = planData.days[dayIndex];
    const targetMeal = targetDay.meals[mealIndex];

    if (!targetMeal) throw new Error("Meal not found");

    // Fetch user goal for context
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User missing");

    // Fetch recipes for suggestion
    const recipes = await db.recipe.findMany({
        where: { userId },
        select: { id: true, title: true, tags: true },
        take: 20
    });

    const cookbookList = recipes.map(r => `- ${r.title} (ID: ${r.id})`).join("\n");

    const prompt = `
        You are a Budget Dietician. I need to REPLACE a single meal in a weekly plan.
        
        OLD MEAL: ${targetMeal.name} (${targetMeal.type})
        TARGET CALORIES: ~${targetMeal.calories} kcal
        USER GOAL: ${user.dailyCalorieGoal} kcal/day
        
        COOKBOOK (Optional matches):
        ${cookbookList}

        INSTRUCTIONS:
        1. Suggest a DIFFERENT, delicious meal for ${targetMeal.type}.
        2. Must be nutritious and budget-friendly.
        3. Use metric units (g, amount).
        4. If using a Cookbook item, include "recipeId".

        OUTPUT JSON ONLY:
        { "name": "New Meal Name", "calories": 500, "ingredients": ["100g Chicken", "Rice"], "recipeId": "optional-uuid" }
    `;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("AI Failed");

    const newMeal = JSON.parse(cleanJsonResponse(content));

    // Preserve type from original if AI forgets it, or update it
    newMeal.type = targetMeal.type;

    // Update Plan Data
    planData.days[dayIndex].meals[mealIndex] = newMeal;

    // Save to DB
    await db.mealPlan.update({
        where: { id: planId },
        data: { planData }
    });

    revalidatePath("/dashboard");
    return { success: true };
}
