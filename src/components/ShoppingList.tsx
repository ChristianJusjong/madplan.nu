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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Shopping List</h3>
                <button
                    onClick={copyToClipboard}
                    className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"
                    title="Copy unchecked items"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
                {/* Generated Items */}
                <div className="space-y-2">
                    {allItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleCheck(item.id!)}
                            className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${checked[item.id!] ? "bg-gray-50 opacity-50" : "hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked[item.id!] ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300"
                                    }`}>
                                    {checked[item.id!] && <Check className="w-3 h-3" />}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${checked[item.id!] ? "line-through text-gray-400" : "text-gray-700"}`}>
                                        {item.item}
                                    </p>
                                    <p className="text-xs text-gray-400">{item.amount}</p>
                                </div>
                            </div>
                            {item.isManual ? (
                                <button onClick={(e) => { e.stopPropagation(); removeExtra(item.id!); }} className="text-gray-300 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                item.estimatedPrice && <span className="text-xs font-medium text-gray-400">{item.estimatedPrice} kr</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
                <p className="text-sm font-medium text-gray-500">Est. Total</p>
                <p className="font-bold text-emerald-600">{totalEstimated} DKK</p>
            </div>

            {/* Add Extra */}
            <form onSubmit={addExtra} className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add item..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button type="submit" className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800">
                    <Plus className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
