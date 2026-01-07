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
    return (
        <div className="space-y-8">
            {planData.days.map((day: DayPlan, i: number) => {
                const dayCalories = day.meals.reduce((acc, meal) => acc + meal.calories, 0);

                return (
                    <div key={i} className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                        {/* Day Header */}
                        <div className="px-8 py-6 bg-white border-b border-zinc-50 flex justify-between items-end">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-zinc-900">{day.day}</h3>
                                <p className="text-zinc-500 font-medium text-sm mt-1">Daily Target: {dayCalories} kcal</p>
                            </div>
                            <div className="h-2 w-24 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min((dayCalories / 2500) * 100, 100)}%` }} // Arbitrary 2500 max for visual bar
                                />
                            </div>
                        </div>

                        {/* Meals List */}
                        <div className="divide-y divide-zinc-50">
                            {day.meals.map((meal, j) => {
                                const isLoading = loading === `${i}-${j}`;
                                return (
                                    <div key={j} className="group p-6 hover:bg-zinc-50/50 transition-colors relative">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                            {/* Meal Info */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase bg-zinc-100 px-2 py-1 rounded-md">
                                                        {meal.type}
                                                    </span>
                                                    {meal.recipeId && !isLoading && (
                                                        <Link
                                                            href="/recipes"
                                                            className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <ChefHat className="w-3 h-3" />
                                                            <span>COOKBOOK</span>
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <h4 className={`text-lg font-semibold text-zinc-900 leading-tight group-hover:text-emerald-700 transition ${isLoading ? "opacity-50" : ""}`}>
                                                        {isLoading ? "Finding new delicious meal..." : meal.name}
                                                    </h4>
                                                </div>

                                                {/* Ingredients */}
                                                {!isLoading && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {meal.ingredients.map((ing, k) => {
                                                            const isDeal = dealKeywords.some(kw => ing.toLowerCase().includes(kw));
                                                            return (
                                                                <span
                                                                    key={k}
                                                                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${isDeal
                                                                            ? "bg-amber-50 text-amber-900 border-amber-100 font-medium"
                                                                            : "bg-white text-zinc-600 border-zinc-200"
                                                                        }`}
                                                                >
                                                                    {isDeal && <Zap className="w-3 h-3 inline mr-1 text-amber-500" />}
                                                                    {ing}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action & Stats */}
                                            <div className="flex items-center gap-4 self-start md:self-center">
                                                <span className="text-sm font-semibold text-zinc-600 whitespace-nowrap">
                                                    {meal.calories} kcal
                                                </span>
                                                <button
                                                    onClick={() => handleRegenerate(i, j)}
                                                    disabled={!!loading}
                                                    className={`p-2 rounded-full border border-zinc-200 bg-white hover:border-emerald-200 hover:text-emerald-600 hover:shadow-sm transition-all ${isLoading ? "animate-spin text-emerald-500 border-emerald-200" : "text-zinc-400"}`}
                                                    title="Swap this meal"
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
