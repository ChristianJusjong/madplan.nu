"use client";

import { updateUserMetrics } from "@/actions/user";
// Removed Prisma imports to avoid client bundle issues
// import { Gender, ActivityLevel } from "@prisma/client";
import { ArrowRight, Ruler, Scale, User, Activity, Users, Trophy } from "lucide-react";

export default function SetupForm() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
                <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100">
                    <h2 className="text-2xl font-bold text-zinc-900">Welcome to Madplan</h2>
                    <p className="text-zinc-500 mt-1">Let's calculate your personalized plan.</p>
                </div>

                <form action={updateUserMetrics} className="p-8 space-y-8">
                    {/* Personal Stats */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Personal Stats</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Scale className="w-4 h-4 text-emerald-500" /> Weight (kg)
                                </label>
                                <input name="weight" type="number" step="0.1" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. 75" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Ruler className="w-4 h-4 text-emerald-500" /> Height (cm)
                                </label>
                                <input name="height" type="number" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. 180" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <User className="w-4 h-4 text-emerald-500" /> Age
                                </label>
                                <input name="age" type="number" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="e.g. 30" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <User className="w-4 h-4 text-emerald-500" /> Gender
                                </label>
                                <select name="gender" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none">
                                    {Object.values(Gender).map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-100" />

                    {/* Lifestyle */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Lifestyle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Activity className="w-4 h-4 text-emerald-500" /> Activity Level
                                </label>
                                <select name="activityLevel" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                                    {Object.values(ActivityLevel).map((a) => (
                                        <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Trophy className="w-4 h-4 text-emerald-500" /> Goal
                                </label>
                                <select name="goal" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                                    <option value="LOSE_WEIGHT">Lose Weight</option>
                                    <option value="MAINTAIN">Maintain Weight</option>
                                    <option value="GAIN_WEIGHT">Gain Weight</option>
                                    <option value="BUILD_MUSCLE">Build Muscle</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-100" />

                    {/* Family */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Family Planning</h3>
                        <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <p className="text-sm text-emerald-800">
                                We'll scale your shopping list automatically based on family size, but calculate calories for <strong>you</strong>.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-zinc-700">Adults</label>
                                <input name="adults" type="number" min="1" defaultValue="1" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-zinc-700">Children</label>
                                <input name="children" type="number" min="0" defaultValue="0" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2"
                    >
                        Create My Plan <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
