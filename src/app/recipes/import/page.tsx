"use client";

import { useState, useRef, useEffect } from "react";
import { crawlCategory, scrapeRecipe } from "@/actions/scraper";
import { SUPPORTED_SITES } from "@/lib/scraper-config";
import { Loader2, Play, Square, CheckCircle, XCircle, Globe, Terminal } from "lucide-react";
import Link from "next/link";

interface LogEntry {
    timestamp: string;
    message: string;
    type: "info" | "success" | "error";
    url?: string;
}

export default function ImportPage() {
    const [selectedSite, setSelectedSite] = useState<string>("iform");
    const [startPage, setStartPage] = useState(1);
    const [maxPages, setMaxPages] = useState(1);
    const [isScraping, setIsScraping] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [stats, setStats] = useState({ crawled: 0, scraped: 0, failed: 0 });
    const shouldStopRef = useRef(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, type: "info" | "success" | "error" = "info", url?: string) => {
        setLogs((prev) => [
            ...prev,
            { timestamp: new Date().toLocaleTimeString(), message, type, url },
        ]);
    };

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    // Warning for non-admins (Visual only, security is in backend)
    // For now we just show it's a "Global Tool"

    const handleStart = async () => {
        if (isScraping) return;
        setIsScraping(true);
        shouldStopRef.current = false;
        setLogs([]);
        setStats({ crawled: 0, scraped: 0, failed: 0 });

        addLog(`Starting scrape for ${SUPPORTED_SITES[selectedSite].name}...`, "info");

        try {
            for (let i = 0; i < maxPages; i++) {
                if (shouldStopRef.current) break;
                const currentPage = startPage + i;
                addLog(`Crawling page ${currentPage}...`, "info");

                const links = await crawlCategory(selectedSite, currentPage);
                setStats((prev) => ({ ...prev, crawled: prev.crawled + links.length }));
                addLog(`Found ${links.length} recipes on page ${currentPage}`, "info");

                for (const link of links) {
                    if (shouldStopRef.current) break;
                    addLog(`Scraping: ${link}`, "info", link);

                    const result = await scrapeRecipe(link, selectedSite);

                    if (result.success) {
                        setStats((prev) => ({ ...prev, scraped: prev.scraped + 1 }));
                        addLog(result.message, "success", link);
                    } else {
                        setStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
                        addLog(`Failed: ${result.message}`, "error", link);
                    }

                    // Small delay to be nice
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
            addLog("Scraping completed!", "success");
        } catch (error: any) {
            addLog(`Critical error: ${error.message}`, "error");
        } finally {
            setIsScraping(false);
        }
    };

    const handleStop = () => {
        shouldStopRef.current = true;
        addLog("Stopping...", "info");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Import Recipes</h1>
                        <p className="text-gray-600">Scrape and seed recipes from supported websites</p>
                    </div>
                    <Link href="/recipes" className="text-sm text-gray-500 hover:text-gray-900">
                        &larr; Back to Cookbook
                    </Link>
                </Link>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-1 bg-amber-100 rounded-full text-amber-600 shrink-0">
                    <Terminal className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-amber-900 font-semibold text-sm">Admin Tool</h3>
                    <p className="text-amber-700 text-xs mt-1">
                        This tool populates the <strong>Global / Demo</strong> database.
                        Recipes imported here will be visible to <strong>ALL USERS</strong> via the "Demo User".
                        Please use responsibly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Configuration
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Site</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={selectedSite}
                                onChange={(e) => setSelectedSite(e.target.value)}
                                disabled={isScraping}
                            >
                                {Object.entries(SUPPORTED_SITES).map(([key, config]) => (
                                    <option key={key} value={key}>{config.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Page</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={startPage}
                                    onChange={(e) => setStartPage(parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    disabled={isScraping}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Pages</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={maxPages}
                                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                                    className="w-full p-2 border rounded-md"
                                    disabled={isScraping}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            {!isScraping ? (
                                <button
                                    onClick={handleStart}
                                    className="w-full py-2 bg-black text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800"
                                >
                                    <Play className="w-4 h-4" /> Start Scraping
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    className="w-full py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-red-700"
                                >
                                    <Square className="w-4 h-4" /> Stop
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Live Stats</h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xl font-bold">{stats.crawled}</div>
                                <div className="text-xs text-gray-500">Links Found</div>
                            </div>
                            <div className="bg-green-50 p-2 rounded">
                                <div className="text-xl font-bold text-green-600">{stats.scraped}</div>
                                <div className="text-xs text-gray-500">Imported</div>
                            </div>
                            <div className="bg-red-50 p-2 rounded">
                                <div className="text-xl font-bold text-red-600">{stats.failed}</div>
                                <div className="text-xs text-gray-500">Failed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terminal / Log */}
                <div className="lg:col-span-2 bg-gray-900 rounded-xl overflow-hidden flex flex-col shadow-lg">
                    <div className="bg-gray-800 p-3 flex items-center gap-2 border-b border-gray-700">
                        <Terminal className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-mono text-gray-300">Scraper Output Log</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto max-h-[600px] min-h-[400px]">
                        {logs.length === 0 && (
                            <div className="text-gray-500 italic text-center mt-20">Ready to start...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 flex gap-2">
                                <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                                <span className={`${log.type === 'success' ? 'text-green-400' :
                                    log.type === 'error' ? 'text-red-400' : 'text-gray-300'
                                    }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
}
