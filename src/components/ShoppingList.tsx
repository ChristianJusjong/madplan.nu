"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Plus, Trash2 } from "lucide-react";

type Item = {
    item: string;
    amount: string;
    estimatedPrice?: number;
    currency?: string;
    isManual?: boolean;
    id?: string;
};

export default function ShoppingList({ items, planId }: { items: Item[], planId?: string }) {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [extras, setExtras] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState("");

    // Load state from local storage
    useEffect(() => {
        if (!planId) return;
        const savedChecked = localStorage.getItem(`checked-${planId}`);
        const savedExtras = localStorage.getItem(`extras-${planId}`);
        if (savedChecked) setChecked(JSON.parse(savedChecked));
        if (savedExtras) setExtras(JSON.parse(savedExtras));
    }, [planId]);

    // Save state
    useEffect(() => {
        if (!planId) return;
        localStorage.setItem(`checked-${planId}`, JSON.stringify(checked));
        localStorage.setItem(`extras-${planId}`, JSON.stringify(extras));
    }, [checked, extras, planId]);

    const toggleCheck = (id: string) => {
        setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addExtra = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const item: Item = {
            item: newItem,
            amount: "-",
            isManual: true,
            id: `manual-${Date.now()}`
        };

        setExtras(prev => [...prev, item]);
        setNewItem("");
    };

    const removeExtra = (id: string) => {
        setExtras(prev => prev.filter(i => i.id !== id));
        const newChecked = { ...checked };
        delete newChecked[id];
        setChecked(newChecked);
    };

    const allItems = [...items.map((i, idx) => ({ ...i, id: `generated-${idx}` })), ...extras];

    const copyToClipboard = () => {
        const text = allItems
            .filter(i => !checked[i.id!])
            .map(i => `- ${i.amount} ${i.item}`)
            .join("\n");
        navigator.clipboard.writeText(text);
        alert("Shopping list copied!");
    };

    const totalEstimated = items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);

    return (
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6 sticky top-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-xl text-zinc-900">Shopping List</h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Organized by store</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl transition-all"
                    title="Copy unchecked items"
                >
                    <Copy className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-8 mb-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Generated Items */}
                <div className="space-y-4">
                    {allItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id!)}
                            className={`group flex justify-between items-start gap-3 cursor-pointer select-none transition-all ${checked[item.id!] ? "opacity-30" : "opacity-100"}`}
                        >
                            <div className="flex items-start gap-3 pt-0.5">
                                <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all mt-0.5 ${checked[item.id!]
                                        ? "bg-zinc-900 border-zinc-900 text-white"
                                        : "border-zinc-300 group-hover:border-emerald-500"
                                    }`}>
                                    {checked[item.id!] && <Check className="w-3 h-3" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium leading-tight ${checked[item.id!] ? "line-through" : "text-zinc-800"}`}>
                                        {item.item}
                                    </p>
                                    <p className="text-[11px] font-semibold text-zinc-400 mt-0.5">{item.amount}</p>
                                </div>
                            </div>

                            {item.isManual ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeExtra(item.id!); }}
                                    className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                item.estimatedPrice && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
                                    {item.estimatedPrice} kr
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-6 border-t border-zinc-100 mb-6">
                <p className="text-sm font-medium text-zinc-500">Est. Total</p>
                <p className="text-xl font-bold text-zinc-900 tracking-tight">{totalEstimated} DKK</p>
            </div>

            {/* Add Extra */}
            <form onSubmit={addExtra} className="relative">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add extra item..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
