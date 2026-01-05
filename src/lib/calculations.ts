import { Gender, ActivityLevel } from "@prisma/client";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
    [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
    [ActivityLevel.VERY_ACTIVE]: 1.725,
    [ActivityLevel.EXTRA_ACTIVE]: 1.9,
};

export interface CalorieResult {
    bmr: number;
    tdee: number;
    dailyCalorieGoal: number;
}

export function calculateBMR(
    weight: number, // kg
    height: number, // cm
    age: number,    // years
    gender: Gender
): number {
    // Mifflin-St Jeor Equation
    // Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
    // Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === Gender.MALE ? base + 5 : base - 161;
}

export function calculateCalories(
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel
): CalorieResult {
    const bmr = calculateBMR(weight, height, age, gender);
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
    const tdee = bmr * multiplier;

    // Standard 500 kcal deficit for weight loss
    const dailyCalorieGoal = tdee - 500;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        // Safety floor: generic health advice usually suggests not going below 1200/1500 without supervision.
        // I'll leave strictly calculated for now but ensuring it's not negative.
        dailyCalorieGoal: Math.round(Math.max(1200, dailyCalorieGoal)),
    };
}
