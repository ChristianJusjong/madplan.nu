"use client";

import { useState } from "react";
import { Settings, X, Users, Target } from "lucide-react";
import { updatePreferences } from "@/actions/settings";
import type { User } from "@prisma/client";

export default function SettingsModal({ user }: { user: User }) {
    const [isOpen, setIsOpen] = useState(false);
    const prefs = (user.preferences as any) || {};
    const family = (user.familyMembers as any) || { adults: 1, children: 0 };
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Plan Settings</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={updatePreferences} onSubmit={() => setTimeout(() => setIsOpen(false), 500)}>
                            <div className="p-6 space-y-8">
                                {/* GOAL SECTION */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Your Goal
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {goals.map((g) => (
                                            <label key={g} className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${user.goal === g ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'hover:bg-gray-50'}`}>
                                                <input type="radio" name="goal" value={g} defaultChecked={user.goal === g} className="sr-only" />
                                                <span className="text-sm font-medium block">{g.replace(/_/g, " ")}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* FAMILY SECTION */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Family
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Adults</label>
                                            <input name="adults" type="number" min="1" defaultValue={family.adults} className="w-full border rounded-md p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Children</label>
                                            <input name="children" type="number" min="0" defaultValue={family.children} className="w-full border rounded-md p-2" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">Shopping list will scale for the whole family.</p>
                                </div>

                                {/* PREFERENCES SECTION */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-emerald-600 tracking-wider">Strategy</h3>

                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="skipLunch"
                                            defaultChecked={prefs.skipLunch}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Eat Lunch at Work</p>
                                            <p className="text-xs text-gray-500">Skips Lunch entries (Mon-Fri)</p>
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
                                            <p className="font-medium text-gray-900">Cook for Leftovers</p>
                                            <p className="text-xs text-gray-500">Dinner ×2 for next day Lunch</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
