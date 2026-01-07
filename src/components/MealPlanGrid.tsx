"use client";

import { Check, Coins, ChefHat, Zap } from "lucide-react";
import Link from "next/link";

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

export default function MealPlanGrid({ planData }: { planData: any }) {
    if (!planData || !planData.days) return null;

    // Hardcoded deal list for demo purposes (simple matching)
    // In a real app, this would come from the generated JSON or Deal Service context
    const dealKeywords = ["kylling", "oksekød", "æg", "mælk", "smør", "kaffe", "pasta", "ris"];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {planData.days.map((day: DayPlan, i: number) => {
                const dayCalories = day.meals.reduce((acc, meal) => acc + meal.calories, 0);

                return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{day.day}</h3>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Total: {dayCalories} kcal
                            </span>
                        </div>
                        <div className="p-6 space-y-6">
                            {day.meals.map((meal, j) => (
                                <div key={j} className="group">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition">
                                                {meal.name}
                                            </h4>
                                            {meal.recipeId && (
                                                <Link
                                                    href="/recipes"
                                                    className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-200 uppercase font-bold tracking-wider"
                                                    title="Saved in Cookbook"
                                                >
                                                    <ChefHat className="w-3 h-3" /> Recipe
                                                </Link>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            {meal.calories} kcal
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">{meal.type}</p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {meal.ingredients.map((ing, k) => {
                                            const isDeal = dealKeywords.some(kw => ing.toLowerCase().includes(kw));
                                            return (
                                                <span
                                                    key={k}
                                                    className={`text-[10px] px-2 py-0.5 rounded border ${isDeal
                                                            ? "bg-yellow-50 text-yellow-700 border-yellow-200 font-medium"
                                                            : "bg-gray-50 text-gray-600 border-gray-100"
                                                        }`}
                                                >
                                                    {isDeal && <Zap className="w-3 h-3 inline mr-1 -mt-0.5" />}
                                                    {ing}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
