"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { cleanJsonResponse } from "@/lib/utils";

export async function getRecipes() {
    const { userId } = await auth();
    if (!userId) return [];

    return db.recipe.findMany({
        where: {
            OR: [
                { userId },
                { userId: "demo-user-id" }
            ]
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function deleteRecipe(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db.recipe.delete({ where: { id, userId } });
    revalidatePath("/recipes");
}

export async function importRecipeFromUrl(url: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        // 1. Fetch HTML (naive approach, works for SSR sites like Valdemarsro/Arla)
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MadplanBot/1.0)" } });
        const html = await res.text();

        // Truncate HTML to avoid token limits (keep first 50k chars, usually contains the recipe)
        const truncatedHtml = html.substring(0, 50000);

        // 2. AI Parsing
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const prompt = `
            EXTRACT RECIPE FROM HTML.
            URL: ${url}
            HTML: ${truncatedHtml}
            
            OUTPUT JSON ONLY:
            {
                "title": "Recipe Title",
                "description": "Short description",
                "ingredients": ["500g Chicken", "2 onions"],
                "instructions": ["Step 1: Chop onions...", "Step 2: Fry..."],
                "prepTime": 15, // minutes
                "cookTime": 30, // minutes
                "servings": 4, // integer
                "tags": ["Dinner", "Chicken"]
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("AI extraction failed");

        const data = JSON.parse(cleanJsonResponse(content));

        // 3. Save to DB
        await db.recipe.create({
            data: {
                userId,
                title: data.title || "Untitled Recipe",
                description: data.description,
                ingredients: data.ingredients || [],
                instructions: data.instructions || [],
                prepTime: data.prepTime || 0,
                cookTime: data.cookTime || 0,
                servings: data.servings || 4,
                tags: data.tags || [],
                sourceUrl: url,
            }
        });

        revalidatePath("/recipes");
        return { success: true };

    } catch (error) {
        console.error("Import failed:", error);
        return { success: false, error: "Failed to import recipe. The site might be blocking bots." };
    }
}
