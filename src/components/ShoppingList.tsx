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
    checked?: boolean; // For manual items from DB
};

import { toggleItem, addExtraItem, removeExtraItem } from "@/actions/shopping-list";

interface ShoppingListProps {
    items: Item[];
    planId: string;
    initialChecked?: string[];
    initialExtras?: Item[];
}

export default function ShoppingList({ items, planId, initialChecked = [], initialExtras = [] }: ShoppingListProps) {
    // Optimistic state
    const [checkedIds, setCheckedIds] = useState<string[]>(initialChecked);
    const [extras, setExtras] = useState<Item[]>(initialExtras);
    const [newItem, setNewItem] = useState("");
    const [isPending, setIsPending] = useState(false);

    // Removed localStorage effects

    const handleToggleCheck = async (id: string) => {
        // Optimistic update
        const wasChecked = checkedIds.includes(id);
        setCheckedIds(prev => wasChecked ? prev.filter(i => i !== id) : [...prev, id]);

        try {
            await toggleItem(planId, id);
        } catch (e) {
            console.error("Failed to toggle item", e);
            // Revert on error
            setCheckedIds(prev => wasChecked ? [...prev, id] : prev.filter(i => i !== id));
        }
    };

    const handleAddExtra = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim() || isPending) return;

        const tempId = `manual-temp-${Date.now()}`;
        const item: Item = {
            item: newItem,
            amount: "-",
            isManual: true,
            id: tempId
        };

        setExtras(prev => [...prev, item]);
        setNewItem("");
        setIsPending(true);

        try {
            await addExtraItem(planId, item.item);
            // Revalidation will update the list with real ID
        } catch (e) {
            console.error("Failed to add extra", e);
            setExtras(prev => prev.filter(i => i.id !== tempId));
        } finally {
            setIsPending(false);
        }
    };

    const handleRemoveExtra = async (id: string) => {
        const itemToRemove = extras.find(i => i.id === id);
        if (!itemToRemove) return;

        setExtras(prev => prev.filter(i => i.id !== id));
        // Also uncheck if checked
        if (checkedIds.includes(id)) {
            setCheckedIds(prev => prev.filter(i => i !== id));
        }

        try {
            await removeExtraItem(planId, id);
        } catch (e) {
            console.error("Failed to remove extra", e);
            setExtras(prev => [...prev, itemToRemove]);
        }
    };



    const allItems = [...items.map((i, idx) => ({ ...i, id: `generated-${idx}` })), ...extras];

    const copyToClipboard = () => {
        const text = allItems
            .filter(i => !checkedIds.includes(i.id!))
            .map(i => `- ${i.amount} ${i.item}`)
            .join("\n");
        navigator.clipboard.writeText(text);
        alert("Shopping list copied!");
    };

    const totalEstimated = items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);

    return (
        <div className="glass-card rounded-3xl p-6 sticky top-24 max-h-[85vh] flex flex-col shadow-xl shadow-emerald-900/5 z-10">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100/50">
                <div>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        Indkøbsliste <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{allItems.filter(i => !checkedIds.includes(i.id!)).length}</span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Sorteret efter butik</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-xl transition-all"
                    title="Kopier umarkerede varer"
                >
                    <Copy className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 mb-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {/* Generated Items */}
                <div className="space-y-2">
                    {allItems.map((item) => {
                        const isChecked = checkedIds.includes(item.id!);
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleToggleCheck(item.id!)}
                                className={`group flex justify-between items-center gap-3 cursor-pointer select-none p-2 rounded-lg transition-all ${isChecked ? "bg-gray-50/50 opacity-50" : "hover:bg-white/60"}`}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${isChecked
                                        ? "bg-emerald-500 border-emerald-500 text-white scale-100"
                                        : "border-zinc-300 bg-white group-hover:border-emerald-400"
                                        }`}>
                                        <Check className={`w-3.5 h-3.5 transition-transform ${isChecked ? "scale-100" : "scale-0"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium leading-tight transition-all ${isChecked ? "line-through text-zinc-400" : "text-zinc-800"}`}>
                                            {item.item}
                                        </p>
                                        <p className="text-[11px] font-bold text-zinc-400 mt-0.5">{item.amount}</p>
                                    </div>
                                </div>

                                {item.isManual ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveExtra(item.id!); }}
                                        className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    item.estimatedPrice && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 whitespace-nowrap shadow-sm">
                                        {item.estimatedPrice} kr
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-100/50 mb-4 bg-white/30 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Estimeret Total</p>
                    <p className="text-xl font-bold text-emerald-600 tracking-tight">{totalEstimated} DKK</p>
                </div>
            </div>

            {/* Add Extra */}
            <form onSubmit={handleAddExtra} className="relative mt-auto">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Tilføj vare..."
                    className="w-full bg-white/70 border border-zinc-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                />
                <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-zinc-800 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-zinc-800 transition-colors shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
