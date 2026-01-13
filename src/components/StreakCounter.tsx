"use client";

import { Flame } from "lucide-react";

export default function StreakCounter({ streak = 0 }: { streak?: number }) {
    if (streak === 0) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm animate-pulse-subtle" title="Din streak! Log ind dagligt for at holde den kørende.">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
            <span>{streak}</span>
        </div>
    );
}
