"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PantryItemSchema = z.object({
    name: z.string().min(1),
    amount: z.string().optional(),
    unit: z.string().optional(),
});

export async function getPantryItems() {
    const { userId } = await auth();
    if (!userId) return [];

    return await db.pantryItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}

export async function addPantryItem(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const amount = formData.get("amount") as string;

    if (!name) return;

    await db.pantryItem.create({
        data: {
            userId,
            name,
            amount,
        },
    });

    revalidatePath("/dashboard/pantry");
}

export async function deletePantryItem(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.pantryItem.delete({
        where: { id, userId },
    });

    revalidatePath("/dashboard/pantry");
}

export async function suggestRecipesFromPantry() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // In a real app, this would use AI (Groq) to match pantry items to recipes.
    // For now, we'll return a comprehensive mock response or search existing recipes.

    const pantryItems = await db.pantryItem.findMany({
        where: { userId },
        select: { name: true }
    });

    const ingredients = pantryItems.map(p => p.name.toLowerCase());

    if (ingredients.length === 0) return [];

    // Simple keyword matching for demo purposes
    // Real implementation would use vector search or LLM
    const recipes = await db.recipe.findMany({
        take: 5,
    });

    // Calculate a "match score" based on ingredients
    return recipes.map(recipe => {
        const recipeIngredients = (recipe.ingredients as string[]).map(i => i.toLowerCase());
        const matchCount = recipeIngredients.filter(ri =>
            ingredients.some(pi => ri.includes(pi) || pi.includes(ri))
        ).length;

        return {
            ...recipe,
            matchScore: matchCount,
            missingIngredients: recipeIngredients.filter(ri =>
                !ingredients.some(pi => ri.includes(pi) || pi.includes(ri))
            )
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}
