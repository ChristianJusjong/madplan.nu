import { db } from "@/lib/db";
import SetupForm from "@/components/SetupForm";
import MealPlanGrid from "@/components/MealPlanGrid";
import { generateWeeklyPlan } from "@/actions/generatePlan";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const userId = "demo-user-id";

    // Fetch data
    const user = await db.user.findUnique({ where: { id: userId } });
    const mealPlan = await db.mealPlan.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });

    const generateAction = async () => {
        "use server";
        await generateWeeklyPlan(userId);
        revalidatePath("/dashboard");
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <SetupForm />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8 flex justify-between items-center">
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
                <MealPlanGrid planData={mealPlan.planData} />
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-xl text-gray-600 mb-4">No plan generated yet.</h2>
                    <form action={generateAction}>
                        <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-emerald-700 transition">
                            Generate My Budget Plan
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
