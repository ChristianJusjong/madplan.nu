import { z } from "zod";

export const FamilyMembersSchema = z.object({
    adults: z.coerce.number().min(1).default(1),
    children: z.coerce.number().min(0).default(0),
});

export const UserPreferencesSchema = z.object({
    skipLunch: z.boolean().default(false),
    leftovers: z.boolean().default(false),
});

export type FamilyMembers = z.infer<typeof FamilyMembersSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// AI Generation Schemas
export const MealSchema = z.object({
    name: z.string(),
    calories: z.coerce.number(),
    ingredients: z.array(z.string()),
    recipeId: z.string().optional(),
    type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
});

export type GeneratedMeal = z.infer<typeof MealSchema>;
