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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {days.map((day) => (
                <div key={day.day} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                        <h3 className="text-lg font-semibold text-green-800">{day.day}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {day.meals.map((meal, idx) => (
                            <div key={idx} className="flex flex-col border-b border-dashed border-gray-100 last:border-0 pb-3 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{meal.type}</span>
                                    <span className="text-xs font-mono text-gray-500">{meal.calories} kcal</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <h4 className="font-medium text-gray-900">{meal.name}</h4>
                                    {isOnDeal(meal.ingredients) && (
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-medium border border-yellow-200">
                                            <Coins className="w-3 h-3" /> On Sale
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
