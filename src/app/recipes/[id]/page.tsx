import { getRecipe, deleteRecipe } from "@/actions/recipes";
import Link from "next/link";
import { ArrowLeft, Clock, Utensils, Users, Trash2, Edit, Calendar } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
    const { id } = await params;
    const recipe = await getRecipe(id);
    const { userId } = await auth();

    if (!recipe) {
        notFound();
    }

    const simpleInstructions = Array.isArray(recipe.instructions)
        ? recipe.instructions as string[]
        : typeof recipe.instructions === 'string'
            ? (recipe.instructions as string).split('\n').filter(Boolean)
            : [];

    const simpleIngredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients as string[]
        : [];

    return (
        <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20">
            {/* Header / Nav */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-100">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/recipes" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        {recipe.userId === userId && (
                            <form action={async () => {
                                "use server";
                                await deleteRecipe(recipe.id);
                            }}>
                                <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Slet opskrift">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Hero Section */}
                <div className="mb-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {recipe.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                        {recipe.title}
                    </h1>

                    {recipe.description && (
                        <p className="text-zinc-500 text-lg leading-relaxed mb-6">
                            {recipe.description}
                        </p>
                    )}

                    <div className="flex items-center gap-6 py-4 border-y border-zinc-100 text-sm font-medium text-zinc-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-500" />
                            <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            <span>{recipe.servings} pers.</span>
                        </div>
                        {recipe.sourceUrl && (
                            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-600 transition-colors">
                                <span className="truncate max-w-[150px]">{new URL(recipe.sourceUrl).hostname}</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-[1fr_1.5fr] gap-10">

                    {/* Ingredients Column */}
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 sticky top-24 pt-4 bg-white z-0">
                            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">1</span>
                            Ingredienser
                        </h2>

                        <div className="space-y-3">
                            {simpleIngredients.length > 0 ? (
                                simpleIngredients.map((ingredient, i) => (
                                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group">
                                        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-zinc-700 group-hover:text-zinc-900 leading-relaxed text-[15px] select-none">
                                            {ingredient}
                                        </span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-zinc-400 italic">Ingen ingredienser registreret.</p>
                            )}
                        </div>
                    </div>

                    {/* Instructions Column */}
                    <div>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 sticky top-24 pt-4 bg-white z-0">
                            <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 text-sm">2</span>
                            Fremgangsmåde
                        </h2>

                        <div className="space-y-8">
                            {simpleInstructions.length > 0 ? (
                                simpleInstructions.map((step, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full bg-zinc-200" />
                                        <div className="text-zinc-500 text-xs font-bold uppercase mb-1 tracking-wider">Trin {i + 1}</div>
                                        <p className="text-zinc-800 leading-relaxed text-base md:text-lg">
                                            {step}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-zinc-400 italic">Ingen fremgangsmåde registreret.</p>
                            )}
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
