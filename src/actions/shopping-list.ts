"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleItem(planId: string, itemId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const list = await db.shoppingList.findFirst({
        where: { mealPlanId: planId, mealPlan: { userId } }
    });

    if (!list) throw new Error("List not found");

    const currentChecked = list.checked || [];
    let newChecked;

    if (currentChecked.includes(itemId)) {
        newChecked = currentChecked.filter(id => id !== itemId);
    } else {
        newChecked = [...currentChecked, itemId];
    }

    await db.shoppingList.update({
        where: { id: list.id },
        data: { checked: newChecked }
    });

    revalidatePath("/dashboard");
}

export async function addExtraItem(planId: string, itemName: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const list = await db.shoppingList.findFirst({
        where: { mealPlanId: planId, mealPlan: { userId } }
    });

    if (!list) throw new Error("List not found");

    const newItem = {
        id: `manual-${Date.now()}`,
        item: itemName,
        amount: "-",
        isManual: true,
        checked: false
    };

    const currentExtras = (list.extras as any[]) || [];

    await db.shoppingList.update({
        where: { id: list.id },
        data: { extras: [...currentExtras, newItem] }
    });

    revalidatePath("/dashboard");
}

export async function removeExtraItem(planId: string, itemId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const list = await db.shoppingList.findFirst({
        where: { mealPlanId: planId, mealPlan: { userId } }
    });

    if (!list) throw new Error("List not found");

    const currentExtras = (list.extras as any[]) || [];
    const newExtras = currentExtras.filter((i: any) => i.id !== itemId);

    await db.shoppingList.update({
        where: { id: list.id },
        data: { extras: newExtras }
    });

    revalidatePath("/dashboard");
}
