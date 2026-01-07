"use client";

import { Check, Coins, ChefHat } from "lucide-react";

type Meal = {
    type: string;
    name: string;
    calories: number;
    ingredients: string[];
};

type DayPlan = {
    day: string;
    meals: Meal[];
};

export default function MealPlanGrid({ planData }: { planData: any }) {
    const { days } = planData as { days: DayPlan[] };

    // Hardcoded for now, ideally matched with server logic
    const deals = ["minced beef", "carrots", "eggs", "chicken", "rice", "broccoli", "tuna", "salmon", "spinach"];

    const isOnDeal = (ingredients: string[]) => {
        return ingredients.some(ing => deals.some(deal => ing.toLowerCase().includes(deal.toLowerCase())));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {days.map((day) => (
                <div key={day.day} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col h-full">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-emerald-800">{day.day}</h3>
                        <ChefHat className="w-4 h-4 text-emerald-600 opacity-50" />
                    </div>
                    <div className="p-4 space-y-4 flex-grow">
                        {day.meals.map((meal, idx) => (
                            <div key={idx} className="flex flex-col border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">{meal.type}</span>
                                    <span className="text-xs font-mono text-gray-400">{meal.calories} kcal</span>
                                </div>
                                <div className="mt-1">
                                    <h4 className="font-semibold text-gray-900 leading-tight">{meal.name}</h4>

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {meal.ingredients.map((ing, i) => (
                                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${deals.some(deal => ing.toLowerCase().includes(deal.toLowerCase()))
                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    : "bg-gray-50 text-gray-600 border-gray-100"
                                                }`}>
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                        Total: {day.meals.reduce((acc, m) => acc + m.calories, 0)} kcal
                    </div>
                </div>
            ))}
        </div>
    );
}
