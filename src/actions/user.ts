"use server";

import { db } from "@/lib/db";
import { calculateCalories } from "@/lib/calculations";
import { Gender, ActivityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function updateUserMetrics(formData: FormData) {
    const user = await currentUser();
    if (!user) return redirect("/");

    const userId = user.id;
    const userEmail = user.emailAddresses[0]?.emailAddress || `${userId}@example.com`;

    const width = parseFloat(formData.get("weight") as string);
    const height = parseFloat(formData.get("height") as string);
    const age = parseInt(formData.get("age") as string);
    const gender = formData.get("gender") as Gender;
    const activityLevel = formData.get("activityLevel") as ActivityLevel;

    // Parse new fields
    const goal = (formData.get("goal") as any) || "LOSE_WEIGHT";
    const adults = parseInt((formData.get("adults") as string) || "1");
    const children = parseInt((formData.get("children") as string) || "0");

    // Calculate new stats
    const { bmr, dailyCalorieGoal } = calculateCalories(
        width,
        height,
        age,
        gender,
        activityLevel,
        goal
    );

    const familyMembers = { adults, children };

    // Upsert user (create if not exists)
    await db.user.upsert({
        where: { id: userId },
        update: {
            weight: width,
            height,
            age,
            gender,
            activityLevel,
            bmr,
            dailyCalorieGoal,
            email: userEmail,
            goal,
            familyMembers
        },
        create: {
            id: userId,
            weight: width,
            height,
            age,
            gender,
            activityLevel,
            bmr,
            dailyCalorieGoal,
            email: userEmail,
            goal,
            familyMembers
        },
    });

    revalidatePath("/dashboard");
}
