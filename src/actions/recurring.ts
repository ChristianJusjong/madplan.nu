"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addRecurringMeal(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const calories = parseInt(formData.get("calories") as string);
    const day = formData.get("day") as string; // "DAILY" or specific day like "MONDAY"

    let days: string[] = [];
    if (day === "DAILY") {
        days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    } else {
        days = [day];
    }

    await db.recurringMeal.create({
        data: {
            userId,
            name,
            type,
            calories,
            days
        }
    });

    revalidatePath("/dashboard");
}

export async function deleteRecurringMeal(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.recurringMeal.delete({
        where: {
            id,
            userId // Ensure user owns the meal
        }
    });

    revalidatePath("/dashboard");
}
