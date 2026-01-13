import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import CookView from "@/components/CookView";

export default async function CookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch recipe
    const recipe = await db.recipe.findUnique({
        where: { id: id }
    });

    if (!recipe) {
        notFound();
    }

    // Transform data safely
    const parsedRecipe = {
        id: recipe.id,
        title: recipe.title,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients as string[] : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions as string[] : [],
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings
    };

    return (
        <CookView recipe={parsedRecipe} />
    );
}
