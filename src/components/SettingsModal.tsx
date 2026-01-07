"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";
import { updatePreferences } from "@/actions/settings";

type Preferences = {
    skipLunch?: boolean;
    leftovers?: boolean;
};

export default function SettingsModal({ initialPreferences }: { initialPreferences: Preferences }) {
    const [isOpen, setIsOpen] = useState(false);

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
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Plan Settings</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={updatePreferences} onSubmit={() => setTimeout(() => setIsOpen(false), 500)}>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Schedule</h3>

                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="skipLunch"
                                            defaultChecked={initialPreferences?.skipLunch}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Eat Lunch at Work</p>
                                            <p className="text-xs text-gray-500">Skips Lunch entries (Mon-Fri)</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Cooking Strategy</h3>

                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            name="leftovers"
                                            defaultChecked={initialPreferences?.leftovers}
                                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Cook for Leftovers</p>
                                            <p className="text-xs text-gray-500">Dinner portions ×2 for next day Lunch</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                                    <p><strong>Note:</strong> All plans use the <strong>Metric System</strong> and optimize for <strong>Zero Food Waste</strong> by default.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition shadow-sm"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
