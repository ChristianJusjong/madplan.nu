"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Groq } from "groq-sdk";
import { revalidatePath } from "next/cache";
import { cleanJsonResponse } from "@/lib/utils";

export async function getRecipes() {
    const { userId } = await auth();
    // if (!userId) return []; // Allow internal use or fallback

    const recipes = await db.recipe.findMany({
        where: {
            OR: [
                { userId: userId || undefined },
                { userId: "demo-user-id" }
            ]
        },
        orderBy: { createdAt: "desc" },
    });
    console.log(`getRecipes found ${recipes.length} recipes for user ${userId || "anon"}`);
    return recipes;
}

export async function getRecipe(id: string) {
    const { userId } = await auth();
    // if (!userId) return null; // Allow viewing demo recipes

    return db.recipe.findUnique({
        where: {
            id,
            OR: [
                { userId: userId || undefined },
                { userId: "demo-user-id" }
            ]
        }
    });
}

export async function deleteRecipe(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    await db.recipe.delete({ where: { id, userId } });
    revalidatePath("/recipes");
}

export async function importRecipeFromUrl(url: string) {
    let { userId } = await auth();
    if (!userId) userId = "demo-user-id"; // Fallback for testing/demo

    try {
        // 1. Fetch HTML
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MadplanBot/1.0)" } });
        const html = await res.text();

        // Remove script and style tags to save tokens
        const cleanHtml = html
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
            .replace(/<!--[\s\S]*?-->/gm, "");

        // Truncate to 20k chars (approx 5-6k tokens), usually enough for main content
        const truncatedHtml = cleanHtml.substring(0, 20000);

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

        console.log("AI Content received:", content.substring(0, 100) + "...");
        const data = JSON.parse(cleanJsonResponse(content));
        console.log("Parsed Data:", JSON.stringify(data, null, 2));

        // 3. Save to DB
        const result = await db.recipe.create({
            data: {
                userId,
                title: data.title || "Untitled Recipe",
                description: data.description,
                ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
                instructions: Array.isArray(data.instructions) ? data.instructions : [],
                prepTime: data.prepTime || 0,
                cookTime: data.cookTime || 0,
                servings: data.servings || 4,
                tags: data.tags || [],
                sourceUrl: url,
            }
        });

        revalidatePath("/recipes");
        console.log("SUCCESS! Created recipe:", result.id);
        return { success: true };

    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log("Recipe already exists (duplicate URL), ignoring.");
            // Optionally fetch existing and redirect? For now just return "success" effectively.
            return { success: true }; // Indicate success as it's not a new error
        }
        console.error("\nERROR DETAILS:");
        console.error(error);
        return { success: false, error: "Failed to import recipe. The site might be blocking bots." };
    } finally {
        await db.$disconnect();
    }
}
