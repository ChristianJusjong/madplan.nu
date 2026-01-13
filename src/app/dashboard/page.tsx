import { db } from "@/lib/db";
import SetupForm from "@/components/SetupForm";
import MealPlanGrid from "@/components/MealPlanGrid";
import ShoppingList from "@/components/ShoppingList";
import { generateWeeklyPlan } from "@/actions/generatePlan";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SettingsModal from "@/components/SettingsModal";
import Link from "next/link";

export const dynamic = "force-dynamic";


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

    const recurringMeals = await db.recurringMeal.findMany({
        where: { userId }
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

    let shoppingListRecord = null;
    if (mealPlan) {
        shoppingListRecord = await db.shoppingList.findUnique({
            where: { mealPlanId: mealPlan.id }
        });

        // Lazy migration: Create DB record if missing but JSON exists
        if (!shoppingListRecord && planData?.shoppingList) {
            console.log("Lazy migrating shopping list to DB...");
            shoppingListRecord = await db.shoppingList.create({
                data: {
                    mealPlanId: mealPlan.id,
                    items: planData.shoppingList,
                    checked: [],
                    extras: []
                }
            });
        }
    }

    return (
        <div className="min-h-screen p-4 lg:p-8 pt-24 pb-20">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in-up">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                            Ugens Madplan <span className="text-2xl">🥗</span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Mål: {user.dailyCalorieGoal} kcal/dag
                            </div>
                            <SettingsModal user={user} recurringMeals={recurringMeals} />
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <Link href="/recipes" className="glass h-12 px-6 rounded-xl flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-white/50 transition-colors flex-1 md:flex-none justify-center">
                            <span>📖</span> Kogebog
                        </Link>
                        <form action={generateAction} className="flex-1 md:flex-none">
                            <button className="w-full h-12 px-6 bg-gray-900 dark:bg-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 font-medium">
                                Generer Ny Plan
                            </button>
                        </form>
                    </div>
                </header>

                {mealPlan ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up [animation-delay:100ms]">
                        {/* Main Content: Meal Plan */}
                        <div className="lg:col-span-8 xl:col-span-9">
                            <MealPlanGrid planData={planData} planId={mealPlan.id} />
                        </div>

                        {/* Sidebar: Shopping List */}
                        <div className="lg:col-span-4 xl:col-span-3">
                            {shoppingListRecord && (
                                <ShoppingList
                                    items={shoppingListRecord.items as any[]}
                                    planId={mealPlan.id}
                                    initialChecked={shoppingListRecord.checked}
                                    initialExtras={shoppingListRecord.extras as any[]}
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center max-w-lg mx-auto mt-20 rounded-3xl animate-fade-in-up">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            🪄
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingen madplan endnu</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Lad vores AI kok sammensætte din perfekte uge på få sekunder.
                        </p>
                        <form action={generateAction}>
                            <button className="w-full bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 hover:scale-[1.02] transition-all">
                                ✨ Generer Min Madplan
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
