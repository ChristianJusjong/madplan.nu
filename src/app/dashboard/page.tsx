import { db } from "@/lib/db";
import SetupForm from "@/components/SetupForm";
import MealPlanGrid from "@/components/MealPlanGrid";
import ShoppingList from "@/components/ShoppingList";
import { generateWeeklyPlan } from "@/actions/generatePlan";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    // Fetch data
    const user = await db.user.findUnique({ where: { id: userId } });
    const mealPlan = await db.mealPlan.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });

    const generateAction = async () => {
        "use server";
        await generateWeeklyPlan();
        revalidatePath("/dashboard");
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <SetupForm />
            </div>
        );
    }

    const planData = mealPlan?.planData as any;

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <header className="mb-8 flex justify-between items-center max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Weekly Meal Plan</h1>
                    <p className="text-gray-600">Goal: {user.dailyCalorieGoal} kcal/day</p>
                </div>
                <form action={generateAction}>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2 font-medium">
                        Generate New Plan
                    </button>
                </form>
            </header>

            {mealPlan ? (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Meal Plan */}
                    <div className="lg:col-span-2">
                        <MealPlanGrid planData={planData} />
                    </div>

                    {/* Sidebar: Shopping List */}
                    <div className="lg:col-span-1">
                        {planData.shoppingList && (
                            <ShoppingList items={planData.shoppingList} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 max-w-md mx-auto">
                    <h2 className="text-xl text-gray-600 mb-4">No plan generated yet.</h2>
                    <form action={generateAction}>
                        <button className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-emerald-700 transition">
                            Generate My Budget Plan
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
