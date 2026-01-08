import { getRecipes, deleteRecipe, importRecipeFromUrl } from "@/actions/recipes";
import Link from "next/link";
import { ArrowLeft, Trash2, Link as LinkIcon, Plus, Loader2, Utensils, Clock, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function RecipesPage() {
    const recipes = await getRecipes();
    const { userId } = await auth();

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-zinc-900">Min Kogebog</h1>
                        <span className="bg-zinc-100 text-zinc-500 text-xs font-bold px-2 py-1 rounded-full">{recipes.length}</span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Import Hero */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-1 bg-gradient-to-br from-emerald-500/5 via-white to-white mb-10">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Udvid din samling</h2>
                        <p className="text-zinc-500 mb-6">Indsæt et link fra Valdemarsro, Arla eller en hvilken som helst opskriftsside. Vi henter den for dig.</p>

                        <form action={async (formData) => {
                            "use server";
                            await importRecipeFromUrl(formData.get("url") as string);
                        }} className="relative max-w-xl">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <LinkIcon className="w-5 h-5 text-zinc-400" />
                            </div>
                            <input
                                name="url"
                                type="url"
                                placeholder="https://..."
                                className="w-full pl-12 pr-32 py-4 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                                required
                            />
                            <button type="submit" className="absolute right-2 top-2 bottom-2 bg-zinc-900 text-white px-6 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Importer
                            </button>
                        </form>
                    </div>
                </div>

                {/* Grid */}
                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden flex flex-col h-full">
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-lg font-bold text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                            {recipe.title}
                                        </h3>
                                        {recipe.userId === userId && (
                                            <form action={async () => {
                                                "use server";
                                                await deleteRecipe(recipe.id);
                                            }}>
                                                <button className="text-zinc-300 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {recipe.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded-md text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-zinc-50 mb-4">
                                        <div className="flex flex-col items-center">
                                            <Clock className="w-4 h-4 text-zinc-400 mb-1" />
                                            <span className="text-xs font-semibold text-zinc-700">{recipe.prepTime || "-"}m</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-zinc-50">
                                            <Utensils className="w-4 h-4 text-zinc-400 mb-1" />
                                            <span className="text-xs font-semibold text-zinc-700">{recipe.cookTime || "-"}m</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-zinc-50">
                                            <Users className="w-4 h-4 text-zinc-400 mb-1" />
                                            <span className="text-xs font-semibold text-zinc-700">{recipe.servings}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        {(recipe.instructions as any[]).slice(0, 2).map((step, i) => (
                                            <p key={i} className="text-sm text-zinc-500 line-clamp-1 pl-3 border-l-2 border-zinc-100">
                                                {step}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {recipe.sourceUrl && (
                                    <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                        <a href={recipe.sourceUrl} target="_blank" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
                                            <LinkIcon className="w-3 h-3" /> Kilde
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Utensils className="w-6 h-6 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900">Din kogebog er tom</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto mt-1">Indsæt et link ovenfor for at tilføje din første opskrift.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
