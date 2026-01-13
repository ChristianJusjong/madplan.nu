"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Goal } from "@prisma/client";
import { calculateCalories } from "@/lib/calculations";
import { FamilyMembersSchema, UserPreferencesSchema } from "@/lib/schemas";

export async function updatePreferences(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");


    // Validate Preferences
    const prefsData = {
        skipLunch: formData.get("skipLunch") === "on",
        leftovers: formData.get("leftovers") === "on",
    };
    const preferences = UserPreferencesSchema.parse(prefsData);

    // Validate Family
    const familyData = {
        adults: formData.get("adults"),
        children: formData.get("children"),
    };
    const familyMembers = FamilyMembersSchema.parse(familyData);

    // Goal
    const goal = formData.get("goal") as Goal;

    // Recalculate Calories based on new Goal
    const { dailyCalorieGoal } = calculateCalories(
        user.weight,
        user.height,
        user.age,
        user.gender,
        user.activityLevel,
        goal
    );

    await db.user.update({
        where: { id: userId },
        data: {
            preferences,
            familyMembers,
            goal,
            dailyCalorieGoal,
        },
    });

    revalidatePath("/dashboard");
}
