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

    // Calculate new stats (Default to LOSE_WEIGHT until set in settings)
    const { bmr, dailyCalorieGoal } = calculateCalories(
        width,
        height,
        age,
        gender,
        activityLevel
    );

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
        },
    });

    revalidatePath("/dashboard");
}
