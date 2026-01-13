import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import StreakCounter from "./StreakCounter";
import { differenceInCalendarDays } from "date-fns";

export default async function StreakWrapper() {
    const { userId } = await auth();

    if (!userId) return null;

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { currentStreak: true, lastLogDate: true }
        });

        if (!user) return null;

        const today = new Date();
        const lastLog = new Date(user.lastLogDate);
        const diff = differenceInCalendarDays(today, lastLog);

        let newStreak = user.currentStreak;
        let shouldUpdate = false;

        if (diff === 0) {
            // Already logged today, do nothing
        } else if (diff === 1) {
            // Logged yesterday, increment
            newStreak += 1;
            shouldUpdate = true;
        } else {
            // Missed a day or more, reset
            newStreak = 1;
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            // Update DB (fire and forget usually or await)
            // Since this is a server component rendering, we should await to ensure consistency
            await db.user.update({
                where: { id: userId },
                data: {
                    currentStreak: newStreak,
                    lastLogDate: today,
                    longestStreak: newStreak > (user.currentStreak || 0) ? newStreak : undefined
                }
            });
        }

        return <StreakCounter streak={newStreak} />;
    } catch (error) {
        console.error("Streak error:", error);
        return null;
    }
}
