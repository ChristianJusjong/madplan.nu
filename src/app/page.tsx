import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, ChefHat, Sparkles, Zap, Leaf, CheckCircle2, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-violet-600">
            Nu med Gourmet AI 2.0
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-in-up [animation-delay:100ms]">
          Din Madplan.
          <br />
          <span className="text-gradient">Genopfundet.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
          Slip for beslutningstræthed. Vi genererer skræddersyede ugeplaner
          der skåner både planeten og din pengepung.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="h-14 px-8 rounded-full bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                Start Gratis <ArrowRight className="w-5 h-5" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="h-14 px-8 rounded-full bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-500 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                Åbn Madplan <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </SignedIn>

          <button className="h-14 px-8 rounded-full glass text-gray-700 dark:text-gray-200 font-semibold text-lg hover:bg-white/50 dark:hover:bg-white/10 transition-all flex items-center gap-2">
            Se hvordan det virker
          </button>
        </div>

        {/* Floating Cards (Decorative) */}
        <div className="absolute top-1/2 left-10 hidden lg:block animate-float [animation-delay:1000ms]">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-3 transform -rotate-6 max-w-xs">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-xl">🥕</span>
            </div>
            <div>
              <p className="font-bold text-sm">Mindre Madspild</p>
              <p className="text-xs text-gray-500">Spar 2.500 kr/år</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/3 right-10 hidden lg:block animate-float [animation-delay:2000ms]">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-3 transform rotate-6 max-w-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-xl">🥗</span>
            </div>
            <div>
              <p className="font-bold text-sm">Sund Livsstil</p>
              <p className="text-xs text-gray-500">Nå dine mål nemmere</p>
            </div>
          </div>
        </div>

      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ChefHat className="w-8 h-8 text-emerald-500" />}
            title="AI Chef"
            description="Personlige opskrifter baseret på dine smagspræferencer og mål."
            delay={100}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-violet-500" />}
            title="Lynhurtigt"
            description="Generer en komplet ugeplan og indkøbsliste på under 5 sekunder."
            delay={200}
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-blue-500" />}
            title="Spar Penge"
            description="Vi optimerer indkøb for at minimere omkostninger og madspild."
            delay={300}
          />
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <div
      className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
