import React from 'react';
import { ArrowRight, CalendarCheck, Utensils, Sparkles, MapPin, Clock, Flame, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeroProps {
  onOrderClick: () => void;
  onReserveClick: () => void;
  onClocheLift: () => void;
  onOpenAIChef?: () => void;
  onCraftClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOrderClick,
  onReserveClick,
  onClocheLift,
  onOpenAIChef,
  onCraftClick,
}) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-3xl">
          {/* Quiet Metadata Kicker (Anti-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-sans-clean mb-6">
            <span>Hayatabad Phase 1</span>
            <span aria-hidden="true">·</span>
            <span>Peshawar</span>
            <span aria-hidden="true">·</span>
            <span>Open Daily Until 3:00 AM</span>
          </div>

          {/* Boutique Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.08] tracking-tight">
            Artisanal Crown Crust & Stone-Deck Baking
          </h1>

          {/* Subtitle with generous line height and calm tone */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
            Where Mediterranean periwinkle serenity meets eighteen hand-crimped mozzarella crown pockets. Slow 24-hour cold-fermented dough blistered at 450°C in Hayatabad, Peshawar.
          </p>

          {/* Clean Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onOrderClick();
              }}
              className="px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Signature Crown</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onReserveClick();
              }}
              className="px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white dark:bg-[#131B2A] hover:bg-stone-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-stone-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <CalendarCheck className="w-4 h-4 text-[#0189FE]" />
              <span>Reserve Table</span>
            </button>

            {onCraftClick && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  onCraftClick();
                }}
                className="px-4 py-3.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                The Baking Craft →
              </button>
            )}
          </div>

          {/* Refined Trust Bar */}
          <div className="mt-12 pt-8 border-t border-stone-200/80 dark:border-slate-800/80 flex flex-wrap items-center gap-8 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-900 dark:text-white text-base">450°C</span>
              <span>Volcanic Stone Deck</span>
            </div>
            <span aria-hidden="true" className="text-stone-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-900 dark:text-white text-base">24h</span>
              <span>Cold Fermented Dough</span>
            </div>
            <span aria-hidden="true" className="text-stone-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-slate-900 dark:text-white text-base">18</span>
              <span>Pinched Mozzarella Crowns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
