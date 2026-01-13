"use client";

import { useTransition, useState } from "react";
import { addPantryItem, deletePantryItem, suggestRecipesFromPantry } from "@/actions/pantry";
import { Plus, Trash2, ChefHat, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface PantryPageProps {
    items: any[];
}

export default function PantryPage({ items = [] }: { items: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [suggestions, setSuggestions] = useState<any[] | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const handleAdd = (formData: FormData) => {
        const form = document.querySelector("form") as HTMLFormElement; // Clean fix for clearing input
        startTransition(async () => {
            await addPantryItem(formData);
            form?.reset();
        });
    };

    const handleSuggest = async () => {
        setLoadingSuggestions(true);
        try {
            const results = await suggestRecipesFromPantry();
            setSuggestions(results);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 pt-24 pb-20">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                            Mit Køleskab <span className="text-2xl">🧊</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Hold styr på dine råvarer og undgå madspild.</p>
                    </div>
                    <button
                        onClick={handleSuggest}
                        disabled={loadingSuggestions}
                        className="glass px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all border border-emerald-100"
                    >
                        {loadingSuggestions ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Få Opskriftsidéer
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Add Item Form & List */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-6">
                        <div className="glass-card p-6 rounded-3xl sticky top-24">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-600" />
                                Tilføj Vare
                            </h2>
                            <form action={handleAdd} className="space-y-3">
                                <input
                                    name="name"
                                    placeholder="Varenavn (f.eks. Mælk)"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                                <div className="flex gap-2">
                                    <input
                                        name="amount"
                                        placeholder="Mængde"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="bg-zinc-900 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Inventory List */}
                        <div className="glass-card p-2 rounded-3xl">
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                                {items.length === 0 && (
                                    <p className="text-center text-gray-400 py-8 italic">Dit køleskab er tomt...</p>
                                )}
                                {items.map((item: any) => (
                                    <div key={item.id} className="group flex justify-between items-center p-3 hover:bg-white/50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            {item.amount && <p className="text-xs text-gray-500">{item.amount}</p>}
                                        </div>
                                        <button
                                            onClick={() => startTransition(() => deletePantryItem(item.id))}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Area */}
                    <div className="md:col-span-7 lg:col-span-8">
                        {suggestions ? (
                            <div className="space-y-4 animate-fade-in-up">
                                <h2 className="text-2xl font-bold mb-6">Forslag baseret på dit køleskab</h2>
                                {suggestions.length === 0 && (
                                    <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">Vi kunne ikke finde nogle opskrifter der matcher dine ingredienser perfekt.</p>
                                    </div>
                                )}
                                {suggestions.map((recipe: any) => (
                                    <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block">
                                        <div className="glass-card p-6 rounded-3xl hover:border-emerald-200 transition-all group hover:shadow-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold group-hover:text-emerald-700 transition-colors">{recipe.title}</h3>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold">
                                                            {recipe.matchScore} matchende ingredienser
                                                        </span>
                                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                            <ChefHat className="w-3 h-3" /> {recipe.cookTime || 30} min
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <ChefHat className="w-5 h-5" />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500 mb-2 font-medium">Mangler:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {recipe.missingIngredients.slice(0, 5).map((ing: string, i: number) => (
                                                        <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-100">
                                                            {ing}
                                                        </span>
                                                    ))}
                                                    {recipe.missingIngredients.length > 5 && (
                                                        <span className="text-xs text-gray-400 self-center">+{recipe.missingIngredients.length - 5} mere</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 text-gray-400 glass-card rounded-3xl border-dashed">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <ChefHat className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Hvad skal vi lave?</h3>
                                <p className="max-w-md mx-auto">Tilføj dine ingredienser til venstre, og tryk på "Få Opskriftsidéer" for at se hvad du kan trylle frem.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
