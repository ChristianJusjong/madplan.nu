import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, ChefHat, Sparkles, Zap, Leaf, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">Madplan.nu</span>
          </div>
          <div className="flex items-center gap-6">
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent rounded-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-3 h-3" />
          <span>New: Intelligent Cookbook Import</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
          Meal Planning on <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Autopilot.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Generate weekly meal plans tailored to your calories, family size, and local supermarket deals. Save money and eat better, effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="h-12 px-8 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 duration-200">
                Start Planning Free <ArrowRight className="w-4 h-4" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="h-12 px-8 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-200">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedIn>
          <button className="h-12 px-8 rounded-full bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
            How it Works
          </button>
        </div>

        {/* Abstract UI Mockup */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 md:p-4 rotate-1 hover:rotate-0 transition-transform duration-700">
            {/* Mock UI Header */}
            <div className="h-8 flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-100" />
              <div className="w-3 h-3 rounded-full bg-yellow-100" />
              <div className="w-3 h-3 rounded-full bg-green-100" />
            </div>
            {/* Mock Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-20 w-full bg-white rounded-lg border border-gray-100" />
                <div className="h-20 w-full bg-white rounded-lg border border-gray-100" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 md:col-span-2">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-emerald-100 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 mb-3" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-gray-50 rounded" />
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="w-8 h-8 rounded-full bg-amber-50 mb-3" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-gray-50 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <BentoCard
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Deal Hunter AI"
              description="We scan Netto, Rema 1000, and Føtex to find the best offers and build meals around them."
            />
            <BentoCard
              icon={<ChefHat className="w-6 h-6 text-emerald-500" />}
              title="Gourmet on a Budget"
              description="Michelin-inspired recipes that don't break the bank. Eat well for less."
            />
            <BentoCard
              icon={<Leaf className="w-6 h-6 text-green-500" />}
              title="Zero Waste Protocol"
              description="Ingredients are reused across the week. Leftover chicken becomes tomorrow's salad."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2024 Madplan.nu. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
