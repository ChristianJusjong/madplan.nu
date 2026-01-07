"use client";

import { useState } from "react";
import { Check, Copy, ShoppingCart } from "lucide-react";

type ShoppingItem = {
    item: string;
    amount: string;
    estimatedPrice: number;
    currency: string;
};

export default function ShoppingList({ items }: { items: ShoppingItem[] }) {
    const [checked, setChecked] = useState<Set<number>>(new Set());

    const toggleItem = (idx: number) => {
        const newChecked = new Set(checked);
        if (newChecked.has(idx)) {
            newChecked.delete(idx);
        } else {
            newChecked.add(idx);
        }
        setChecked(newChecked);
    };

    const copyToClipboard = () => {
        const text = items
            .map((i) => `- [ ] ${i.item} (${i.amount})`)
            .join("\n");
        navigator.clipboard.writeText(text);
        alert("Shopping List copied to clipboard!");
    };

    const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Shopping List</h2>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-emerald-100 hover:text-white transition"
                    title="Copy to Clipboard"
                >
                    <Copy className="w-5 h-5" />
                </button>
            </div>

            <div className="p-0">
                <ul className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                        <li
                            key={idx}
                            onClick={() => toggleItem(idx)}
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-gray-50 ${checked.has(idx) ? "bg-gray-50" : ""
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked.has(idx)
                                            ? "bg-emerald-500 border-emerald-500"
                                            : "border-gray-300"
                                        }`}
                                >
                                    {checked.has(idx) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div>
                                    <p className={`font-medium text-gray-900 ${checked.has(idx) ? "line-through text-gray-400" : ""}`}>
                                        {item.item}
                                    </p>
                                    <p className="text-xs text-gray-500">{item.amount}</p>
                                </div>
                            </div>
                            <span className={`text-sm font-mono ${checked.has(idx) ? "text-gray-300" : "text-gray-600"}`}>
                                {item.estimatedPrice} {item.currency}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Estimated Total</span>
                <span className="text-lg font-bold text-emerald-700">
                    {total} DKK
                </span>
            </div>
        </div>
    );
}
