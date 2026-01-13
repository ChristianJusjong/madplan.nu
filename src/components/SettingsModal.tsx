"use client";

import { useState } from "react";
import { Settings, X, Users, Target, Clock, Trash2, Plus } from "lucide-react";
import { updatePreferences } from "@/actions/settings";
import { addRecurringMeal, deleteRecurringMeal } from "@/actions/recurring";
import type { User, RecurringMeal } from "@prisma/client";

import { FamilyMembersSchema, UserPreferencesSchema, type FamilyMembers, type UserPreferences } from "@/lib/schemas";

export default function SettingsModal({ user, recurringMeals = [] }: { user: User, recurringMeals?: RecurringMeal[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "routine">("general");

    // Safely parse or default
    const prefs = UserPreferencesSchema.safeParse(user.preferences).success
        ? (user.preferences as UserPreferences)
        : { skipLunch: false, leftovers: false };

    const family = FamilyMembersSchema.safeParse(user.familyMembers).success
        ? (user.familyMembers as FamilyMembers)
        : { adults: 1, children: 0 };

    const goals = ["LOSE_WEIGHT", "MAINTAIN", "GAIN_WEIGHT", "BUILD_MUSCLE"];

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                title="Plan Settings"
            >
                <Settings className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-600" />
                                Indstillinger
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === "general" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500"}`}
                            >
                                Generelt
                            </button>
                            <button
                                onClick={() => setActiveTab("routine")}
                                className={`flex-1 py-3 text-sm font-medium ${activeTab === "routine" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500"}`}
                            >
                                Faste Måltider
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {activeTab === "general" ? (
                                <form action={updatePreferences} onSubmit={() => setTimeout(() => setIsOpen(false), 500)}>
                                    <div className="p-6 space-y-8">
                                        {/* GOAL SECTION */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-2">
                                                <Target className="w-4 h-4" /> Dit Mål
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {goals.map((g) => (
                                                    <label key={g} className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${user.goal === g ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                                                        <input type="radio" name="goal" value={g} defaultChecked={user.goal === g} className="sr-only" />
                                                        <span className="text-sm font-medium block">
                                                            {g === "LOSE_WEIGHT" && "Vægttab"}
                                                            {g === "MAINTAIN" && "Vedligehold"}
                                                            {g === "GAIN_WEIGHT" && "Tag på"}
                                                            {g === "BUILD_MUSCLE" && "Opbyg Muskler"}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* FAMILY SECTION */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Familie
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Voksne</label>
                                                    <input name="adults" type="number" min="1" defaultValue={family.adults} className="w-full border rounded-md p-2" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Børn</label>
                                                    <input name="children" type="number" min="0" defaultValue={family.children} className="w-full border rounded-md p-2" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400">Indkøbslisten skaleres til hele familien.</p>
                                        </div>

                                        {/* PREFERENCES SECTION */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider">Strategi</h3>

                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    name="skipLunch"
                                                    defaultChecked={prefs.skipLunch}
                                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">Spiser Frokost Ude</p>
                                                    <p className="text-xs text-gray-500">Skipper frokost i madplanen (Man-Fre)</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    name="leftovers"
                                                    defaultChecked={prefs.leftovers}
                                                    className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">Lav Mad til 2 Dage</p>
                                                    <p className="text-xs text-gray-500">Aftensmad x2 til næste dags frokost</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
                                        >
                                            Gem Ændringer
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-6 space-y-6">
                                    <div className="bg-emerald-50 p-4 rounded-lg flex gap-3 text-sm text-emerald-800">
                                        <Clock className="w-5 h-5 flex-shrink-0" />
                                        <p>Tilføj faste måltider her (f.eks. Havregryn til Morgenmad). AI'en vil springe disse over i planen!</p>
                                    </div>

                                    <div className="space-y-3">
                                        {recurringMeals.map((meal) => (
                                            <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-gray-900">{meal.name}</p>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span className="bg-white px-1.5 py-0.5 rounded border">
                                                            {meal.type === "BREAKFAST" && "Morgenmad"}
                                                            {meal.type === "LUNCH" && "Frokost"}
                                                            {meal.type === "DINNER" && "Aftensmad"}
                                                            {meal.type === "SNACK" && "Snack"}
                                                        </span>
                                                        <span>{meal.calories} kcal</span>
                                                        <span>{meal.days.length === 7 ? "Hver Dag" : meal.days.map(d => {
                                                            const map: Record<string, string> = { "MONDAY": "Man", "TUESDAY": "Tirs", "WEDNESDAY": "Ons", "THURSDAY": "Tors", "FRIDAY": "Fre", "SATURDAY": "Lør", "SUNDAY": "Søn" };
                                                            return map[d] || d;
                                                        }).join(", ")}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteRecurringMeal(meal.id)}
                                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {recurringMeals.length === 0 && (
                                            <p className="text-center text-gray-400 text-sm py-4">Ingen faste måltider endnu.</p>
                                        )}
                                    </div>

                                    <hr />

                                    <form action={addRecurringMeal} className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900">Tilføj Nyt Fast Måltid</h3>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Navn</label>
                                            <input name="name" required placeholder="f.eks. Havregryn & Kaffe" className="w-full border rounded-md p-2 text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Type</label>
                                                <select name="type" className="w-full border rounded-md p-2 text-sm">
                                                    <option value="BREAKFAST">Morgenmad</option>
                                                    <option value="LUNCH">Frokost</option>
                                                    <option value="DINNER">Aftensmad</option>
                                                    <option value="SNACK">Snack</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Kalorier</label>
                                                <input name="calories" type="number" required placeholder="300" className="w-full border rounded-md p-2 text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Frekvens</label>
                                            <select name="day" className="w-full border rounded-md p-2 text-sm">
                                                <option value="DAILY">Hver Dag</option>
                                                <option value="MONDAY">Mandag</option>
                                                <option value="TUESDAY">Tirsdag</option>
                                                <option value="WEDNESDAY">Onsdag</option>
                                                <option value="THURSDAY">Torsdag</option>
                                                <option value="FRIDAY">Fredag</option>
                                                <option value="SATURDAY">Lørdag</option>
                                                <option value="SUNDAY">Søndag</option>
                                            </select>
                                        </div>
                                        <button className="w-full bg-zinc-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Tilføj
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
