"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updatePreferences(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const skipLunch = formData.get("skipLunch") === "on";
    const leftovers = formData.get("leftovers") === "on";

    const preferences = {
        skipLunch,
        leftovers,
    };

    await db.user.update({
        where: { id: userId },
        data: {
            preferences: preferences,
        },
    });

    revalidatePath("/dashboard");
}
