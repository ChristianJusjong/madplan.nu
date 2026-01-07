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
                    <h2 className="text-2xl font-bold text-zinc-900">Velkommen til Madplan</h2>
                    <p className="text-zinc-500 mt-1">Lad os beregne din personlige plan.</p>
                </div>

                <form action={updateUserMetrics} className="p-8 space-y-8">
                    {/* Personal Stats */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Personlige Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Scale className="w-4 h-4 text-emerald-500" /> Vægt (kg)
                                </label>
                                <input name="weight" type="number" step="0.1" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="f.eks. 75" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Ruler className="w-4 h-4 text-emerald-500" /> Højde (cm)
                                </label>
                                <input name="height" type="number" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="f.eks. 180" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <User className="w-4 h-4 text-emerald-500" /> Alder
                                </label>
                                <input name="age" type="number" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="f.eks. 30" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <User className="w-4 h-4 text-emerald-500" /> Køn
                                </label>
                                <select name="gender" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none">
                                    <option value="MALE">Mand</option>
                                    <option value="FEMALE">Kvinde</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-100" />

                    {/* Lifestyle */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Livsstil</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Activity className="w-4 h-4 text-emerald-500" /> Aktivitetsniveau
                                </label>
                                <select name="activityLevel" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                                    <option value="SEDENTARY">Stillesiddende</option>
                                    <option value="LIGHTLY_ACTIVE">Let Aktiv</option>
                                    <option value="MODERATELY_ACTIVE">Moderat Aktiv</option>
                                    <option value="VERY_ACTIVE">Meget Aktiv</option>
                                    <option value="EXTRA_ACTIVE">Ekstra Aktiv</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <Trophy className="w-4 h-4 text-emerald-500" /> Mål
                                </label>
                                <select name="goal" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                                    <option value="LOSE_WEIGHT">Vægttab</option>
                                    <option value="MAINTAIN">Vedligeholdelse</option>
                                    <option value="GAIN_WEIGHT">Tag på</option>
                                    <option value="BUILD_MUSCLE">Opbyg Muskler</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <hr className="border-zinc-100" />

                    {/* Family */}
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Familieplanlægning</h3>
                        <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <p className="text-sm text-emerald-800">
                                Vi skalerer indkøbslisten automatisk til hele familien, men beregner kalorier til <strong>dig</strong>.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-zinc-700">Voksne</label>
                                <input name="adults" type="number" min="1" defaultValue="1" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-zinc-700">Børn</label>
                                <input name="children" type="number" min="0" defaultValue="0" required className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-zinc-200 flex items-center justify-center gap-2"
                    >
                        Opret Min Plan <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
