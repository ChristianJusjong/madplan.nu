"use client";

import { Check, Coins, ChefHat, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";
import { regenerateMeal } from "@/actions/regenerate";
import { useState } from "react";

type Meal = {
    type: string;
    name: string;
    calories: number;
    ingredients: string[];
    recipeId?: string;
};

type DayPlan = {
    day: string;
    meals: Meal[];
};

import { DEAL_KEYWORDS } from "@/lib/constants";

export default function MealPlanGrid({ planData, planId }: { planData: any, planId: string }) {
    const [loading, setLoading] = useState<string | null>(null); // "dayIndex-mealIndex"

    if (!planData || !planData.days) return null;

    // Hardcoded deal list for demo purposes (simple matching)
    // In a real app, this would come from the generated JSON or Deal Service context
    const dealKeywords = DEAL_KEYWORDS;

    const handleRegenerate = async (dayIndex: number, mealIndex: number) => {
        const id = `${dayIndex}-${mealIndex}`;
        setLoading(id);
        try {
            await regenerateMeal(planId, dayIndex, mealIndex);
        } catch (error) {
            console.error(error);
            alert("Failed to swap meal");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            {planData.days.map((day: DayPlan, i: number) => {
                const dayCalories = day.meals.reduce((acc, meal) => acc + meal.calories, 0);

                return (
                    <div key={i} className="glass-card rounded-3xl overflow-hidden group/day">
                        {/* Day Header */}
                        <div className="px-8 py-5 border-b border-gray-100/50 bg-white/40 flex justify-between items-end backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                                    {day.day.substring(0, 3)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-zinc-900">{day.day}</h3>
                                    <p className="text-zinc-500 font-medium text-xs">Mål: {dayCalories} kcal</p>
                                </div>
                            </div>
                            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                                    style={{ width: `${Math.min((dayCalories / 2500) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Meals List */}
                        <div className="divide-y divide-gray-100/50 bg-white/60">
                            {day.meals.map((meal, j) => {
                                const isLoading = loading === `${i}-${j}`;
                                return (
                                    <div key={j} className="group p-6 hover:bg-white/80 transition-all duration-300 relative">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                            {/* Meal Info */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                                        {meal.type}
                                                    </span>
                                                    {meal.recipeId && !isLoading && (
                                                        <Link
                                                            href="/recipes"
                                                            className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md border border-violet-100 hover:bg-violet-100 transition-colors"
                                                        >
                                                            <ChefHat className="w-3 h-3" />
                                                            <span>OPSKRIFT</span>
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <h4 className={`text-lg font-bold text-zinc-800 leading-tight group-hover:text-emerald-700 transition ${isLoading ? "opacity-50" : ""}`}>
                                                        {isLoading ? "Tryller i køkkenet..." : meal.name}
                                                    </h4>
                                                </div>

                                                {/* Ingredients */}
                                                {!isLoading && (
                                                    <div className="flex flex-wrap gap-2 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {meal.ingredients.map((ing, k) => {
                                                            const isDeal = dealKeywords.some(kw => ing.toLowerCase().includes(kw));
                                                            return (
                                                                <span
                                                                    key={k}
                                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isDeal
                                                                        ? "bg-amber-50 text-amber-900 border-amber-200 font-medium shadow-sm"
                                                                        : "bg-white text-zinc-600 border-zinc-200"
                                                                        }`}
                                                                >
                                                                    {isDeal && <Zap className="w-3 h-3 inline mr-1 text-amber-500 fill-amber-500" />}
                                                                    {ing}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action & Stats */}
                                            <div className="flex items-center gap-4 self-start md:self-center">
                                                <span className="text-sm font-bold text-zinc-400 whitespace-nowrap bg-zinc-50 px-3 py-1 rounded-lg">
                                                    {meal.calories} kcal
                                                </span>
                                                <button
                                                    onClick={() => handleRegenerate(i, j)}
                                                    disabled={!!loading}
                                                    className={`p-2.5 rounded-xl border border-transparent bg-transparent hover:bg-white hover:shadow-md hover:border-zinc-100 hover:text-emerald-600 transition-all ${isLoading ? "animate-spin text-emerald-500" : "text-zinc-300"}`}
                                                    title="Erstat måltid med nyt forslag"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
