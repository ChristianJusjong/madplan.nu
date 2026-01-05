"use server";

import { db } from "@/lib/db";
import { calculateCalories } from "@/lib/calculations";
import { Gender, ActivityLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserMetrics(formData: FormData) {
    const userId = "demo-user-id"; // Hardcoded for single-user mvp/demo

    const width = parseFloat(formData.get("weight") as string);
    const height = parseFloat(formData.get("height") as string);
    const age = parseInt(formData.get("age") as string);
    const gender = formData.get("gender") as Gender;
    const activityLevel = formData.get("activityLevel") as ActivityLevel;

    // Calculate new stats
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
            email: "demo@example.com", // Mock email
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
            email: "demo@example.com",
        },
    });

    revalidatePath("/dashboard");
}
