"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, FastForward, Play, ChevronLeft } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface Recipe {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number | null;
    cookTime: number | null;
    servings: number;
}

export default function CookView({ recipe }: { recipe: Recipe }) {
    const [started, setStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    // Request Wake Lock on mount
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    const sentinel = await navigator.wakeLock.request('screen');
                    setWakeLock(sentinel);
                    console.log('Wake Lock active');
                } catch (err) {
                    console.error('Wake Lock failed:', err);
                }
            }
        };

        if (started) {
            requestWakeLock();
        }

        return () => {
            if (wakeLock) {
                wakeLock.release().then(() => setWakeLock(null));
            }
        };
    }, [started]);

    const toggleIngredient = (ing: string) => {
        setCheckedIngredients(prev =>
            prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
        );
    };

    const nextStep = () => {
        if (currentStep < recipe.instructions.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            // Finished!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const progress = ((currentStep + 1) / recipe.instructions.length) * 100;

    if (!started) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-8 animate-fade-in-up">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-emerald-500/50 shadow-2xl mb-8">
                        <Play className="w-10 h-10 fill-white ml-2" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
                        <div className="flex justify-center gap-6 text-gray-400">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                            </div>
                            <div>
                                {recipe.ingredients.length} Ingredienser
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-2xl p-6 text-left border border-gray-700">
                        <h3 className="font-bold mb-4 text-emerald-400">Tjekliste før start:</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {recipe.ingredients.map((ing, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleIngredient(ing)}
                                    className="flex items-start gap-3 cursor-pointer group"
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 ${checkedIngredients.includes(ing) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 group-hover:border-emerald-500/50'}`}>
                                        {checkedIngredients.includes(ing) && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`text-lg transition-colors ${checkedIngredients.includes(ing) ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                        {ing}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setStarted(true)}
                        className="w-full bg-emerald-500 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:bg-emerald-400 hover:scale-[1.02] transition-all active:scale-95"
                    >
                        Start Madlavning
                    </button>

                    <Link href="/dashboard" className="block text-gray-500 hover:text-white transition-colors">
                        Annuller og gå tilbage
                    </Link>
                </div>
            </div>
        );
    }

    const isLastStep = currentStep === recipe.instructions.length - 1;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header / Progress */}
            <header className="px-6 py-6 flex items-center justify-between border-b border-gray-800">
                <button onClick={() => setStarted(false)} className="p-2 -ml-2 text-gray-400 hover:text-white">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 mx-6">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="font-mono text-emerald-400 font-bold">
                    {currentStep + 1} / {recipe.instructions.length}
                </div>
            </header>

            {/* Main Step Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto w-full">
                <div className="mb-8 p-4 bg-emerald-500/10 text-emerald-400 rounded-full inline-flex items-center gap-2 font-bold animate-pulse-subtle">
                    Step {currentStep + 1}
                </div>

                <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-12 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {recipe.instructions[currentStep]}
                </h2>

                {/* Navigation */}
                <div className="flex items-center gap-4 w-full max-w-md mt-auto mb-8">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex-1 py-6 rounded-2xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 mx-auto" />
                    </button>

                    {isLastStep ? (
                        <Link href="/dashboard" className="flex-[3]">
                            <button
                                className="w-full py-6 rounded-2xl bg-emerald-500 text-white font-bold text-xl hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-6 h-6" /> Færdig!
                            </button>
                        </Link>
                    ) : (
                        <button
                            onClick={nextStep}
                            className="flex-[3] py-6 rounded-2xl bg-white text-gray-900 font-bold text-xl hover:bg-gray-200 shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Næste <ArrowRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </main>

            {/* Ingredients visible on current step? Maybe later feature. For now simple. */}
            <div className="p-4 border-t border-gray-800 text-center text-gray-500 text-sm">
                Skærmen forbliver tændt mens du laver mad 💡
            </div>
        </div>
    );
}
