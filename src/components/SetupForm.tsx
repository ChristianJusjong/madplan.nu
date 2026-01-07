"use client";

import { updateUserMetrics } from "@/actions/user";
import { Gender, ActivityLevel } from "@prisma/client";

export default function SetupForm() {
    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Setup Your Plan</h2>
            <form action={updateUserMetrics} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input name="weight" type="number" step="0.1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input name="height" type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input name="age" type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        {Object.values(Gender).map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Activity Level</label>
                    <select name="activityLevel" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        {Object.values(ActivityLevel).map((a) => (
                            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3">Goal & Family</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Goal</label>
                            <select name="goal" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                <option value="LOSE_WEIGHT">Lose Weight</option>
                                <option value="MAINTAIN">Maintain Weight</option>
                                <option value="GAIN_WEIGHT">Gain Weight</option>
                                <option value="BUILD_MUSCLE">Build Muscle</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adults</label>
                                <input name="adults" type="number" min="1" defaultValue="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Children</label>
                                <input name="children" type="number" min="0" defaultValue="0" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Save Metrics
                </button>
            </form>
        </div>
    );
}
