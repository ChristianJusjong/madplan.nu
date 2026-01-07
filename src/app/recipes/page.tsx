import { getRecipes, deleteRecipe, importRecipeFromUrl } from "@/actions/recipes";
import Link from "next/link";
import { ArrowLeft, Trash2, Link as LinkIcon, Plus, Loader2 } from "lucide-react";

export default async function RecipesPage() {
    const recipes = await getRecipes();

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow hover:bg-gray-50">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">My Cookbook 📖</h1>
                    </div>
                </header>

                {/* IMPORT FORM */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-600" /> Import New Recipe
                    </h2>
                    <form action={async (formData) => {
                        "use server";
                        await importRecipeFromUrl(formData.get("url") as string);
                    }} className="flex gap-2">
                        <input
                            name="url"
                            type="url"
                            placeholder="Paste URL (e.g. from valdemarsro.dk)"
                            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                            Import
                        </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-2">
                        Supported: Most recipe sites. The AI will extract ingredients and steps automatically.
                    </p>
                </div>

                {/* RECIPE LIST */}
                <div className="grid gap-4">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{recipe.title}</h3>
                                    <div className="flex gap-3 text-sm text-gray-500 mb-3">
                                        <span>⏱️ {recipe.prepTime || "?"}m prep</span>
                                        <span>🍳 {recipe.cookTime || "?"}m cook</span>
                                        <span>👥 {recipe.servings} servings</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {recipe.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <form action={async () => {
                                    "use server";
                                    await deleteRecipe(recipe.id);
                                }}>
                                    <button className="text-gray-300 hover:text-red-500 p-2">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>

                            {/* PREVIEW */}
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                                <p className="font-semibold text-gray-900">Instructions Preview:</p>
                                {(recipe.instructions as any[]).slice(0, 2).map((step, i) => (
                                    <p key={i} className="line-clamp-1 text-gray-600">• {step}</p>
                                ))}
                                {(recipe.instructions as any[]).length > 2 && <p className="text-xs text-gray-400">...and {(recipe.instructions as any[]).length - 2} more steps</p>}
                            </div>

                            {recipe.sourceUrl && (
                                <a href={recipe.sourceUrl} target="_blank" className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mt-4">
                                    <LinkIcon className="w-3 h-3" /> Original Source
                                </a>
                            )}
                        </div>
                    ))}

                    {recipes.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            Book is empty. Paste a URL to start!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
