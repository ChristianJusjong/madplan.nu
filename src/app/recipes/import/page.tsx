"use client";

import { useState } from "react";
import { processIformPage } from "@/actions/iform";
import { Loader2, Play, CheckCircle, AlertCircle, StopCircle } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
    const [page, setPage] = useState(0); // Start at page 0
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState({ total: 0, created: 0, skipped: 0, errors: 0 });

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev].slice(0, 50));

    async function startScraping() {
        if (isRunning) return;
        setIsRunning(true);
        addLog("Starting scraper...");

        let currentPage = page;
        let keepGoing = true;

        while (keepGoing && isRunning) { // Warning: isRunning state won't update inside loop immediately without ref, but break button can refresh page
            try {
                addLog(`Processing Page ${currentPage}...`);
                const result = await processIformPage(currentPage);

                if (!result.hasMore) {
                    addLog("No more links found. Stopping.");
                    keepGoing = false;
                    break;
                }

                let pCreated = 0;
                let pSkipped = 0;
                let pErrors = 0;

                result.results.forEach(r => {
                    if (r.success) {
                        if (r.status === "created") pCreated++;
                        else pSkipped++;
                    } else {
                        pErrors++;
                    }
                });

                setStats(prev => ({
                    total: prev.total + result.processed,
                    created: prev.created + pCreated,
                    skipped: prev.skipped + pSkipped,
                    errors: prev.errors + pErrors
                }));

                addLog(`Page ${currentPage} done: +${pCreated} new, ${pSkipped} skipped.`);

                currentPage++;
                setPage(currentPage);

            } catch (e) {
                addLog(`Error on page ${currentPage}: ${e}`);
                keepGoing = false;
            }
        }

        setIsRunning(false);
        addLog("Scraping finished or stopped.");
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-8 font-sans text-zinc-900">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Iform.dk Scraper</h1>
                    <Link href="/recipes" className="text-sm text-emerald-600 hover:underline">Back to Cookbook</Link>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-semibold text-sm text-zinc-500 uppercase tracking-widest">Current Page: {page}</p>
                        <p className="text-xs text-zinc-400">Iterates through ?page=0, ?page=1...</p>
                    </div>

                    {!isRunning ? (
                        <button
                            onClick={startScraping}
                            className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" /> Start Scraping
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.reload()} // Hard stop
                            className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 flex items-center gap-2 border border-red-100"
                        >
                            <StopCircle className="w-4 h-4" /> Stop (Reload)
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <p className="text-xs text-zinc-400 font-bold uppercase">Total Processed</p>
                        <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                        <p className="text-xs text-emerald-600 font-bold uppercase">Created</p>
                        <p className="text-2xl font-bold text-emerald-700">{stats.created}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-100">
                        <p className="text-xs text-zinc-400 font-bold uppercase">Skipped</p>
                        <p className="text-2xl font-bold text-zinc-500">{stats.skipped}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-red-100 bg-red-50/50">
                        <p className="text-xs text-red-600 font-bold uppercase">Errors</p>
                        <p className="text-2xl font-bold text-red-700">{stats.errors}</p>
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-zinc-900 text-zinc-400 p-6 rounded-2xl font-mono text-xs h-96 overflow-y-auto space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="border-b border-zinc-800 pb-1 mb-1 last:border-0">
                            <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {log}
                        </div>
                    ))}
                    {logs.length === 0 && <p className="text-zinc-600 italic">Ready to start...</p>}
                </div>
            </div>
        </div>
    );
}
