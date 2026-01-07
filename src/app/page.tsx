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
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Min Madplan</Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log Ind</button>
              </SignInButton>
              <SignInButton mode="modal">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
                  Kom I Gang
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider animate-fade-in-up">
            <Sparkles className="w-3 h-3" />
            <span>Nu med Gourmet AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1]">
            Din Personlige <span className="text-emerald-600">Madplanlægger</span>.
            <br />
            <span className="text-gray-400">Drevet af AI.</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Slut med beslutningstræthed. Få en skræddersyet ugentlig madplan,
            smart indkøbsliste og lækre opskrifter på sekunder.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="h-14 px-8 rounded-full bg-gray-900 text-white font-semibold text-lg hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 flex items-center gap-2">
                  Prøv Gratis <ArrowRight className="w-5 h-5" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="h-14 px-8 rounded-full bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-200 flex items-center gap-2">
                  Gå til Madplan <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Social Proof / Trust */}
          <div className="pt-8 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos or trust indicators could go here */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Spar penge på indkøb
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Mindre madspild
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sundere livsstil
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <BentoCard
              icon={<ChefHat className="w-6 h-6 text-emerald-600" />}
              title="Gourmet Opskrifter"
              description="Vores AI kok skaber spændende, varierede retter baseret på dine præferencer. Aldrig mere kedelig hverdagsmad."
            />

            {/* Card 2 */}
            <BentoCard
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Lynhurtig Planlægning"
              description="Generer en hel uges madplan med ét klik. Tilpas nemt dage, erstat måltider og skalér opskrifter."
            />

            {/* Card 3 */}
            <BentoCard
              icon={<Leaf className="w-6 h-6 text-green-500" />}
              title="Mindre Madspild"
              description="Planlæg smart med rester og udnyt dine råvarer bedre. Godt for miljøet og din pengepung."
            />

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2024 Madplan.nu. Alle rettigheder forbeholdes.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">Privatliv</a>
            <a href="#" className="hover:text-gray-900">Vilkår</a>
            <a href="#" className="hover:text-gray-900">Kontakt</a>
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
