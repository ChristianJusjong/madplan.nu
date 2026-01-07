import { Gender, ActivityLevel, Goal } from "@prisma/client";

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
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === Gender.MALE ? base + 5 : base - 161;
}

export function calculateCalories(
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel,
    goal: Goal = Goal.LOSE_WEIGHT
): CalorieResult {
    const bmr = calculateBMR(weight, height, age, gender);
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
    const tdee = bmr * multiplier;

    let adjustment = 0;
    switch (goal) {
        case Goal.LOSE_WEIGHT:
            adjustment = -500;
            break;
        case Goal.MAINTAIN:
            adjustment = 0;
            break;
        case Goal.GAIN_WEIGHT:
        case Goal.BUILD_MUSCLE:
            adjustment = 300;
            break;
    }

    const dailyCalorieGoal = tdee + adjustment;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalorieGoal: Math.round(Math.max(1200, dailyCalorieGoal)),
    };
}
