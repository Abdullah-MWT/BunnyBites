import React from 'react';
import { ArrowRight, CalendarCheck, Utensils, Sparkles, MapPin, Clock, Flame, QrCode, Award } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeroProps {
  onOrderClick: () => void;
  onReserveClick: () => void;
  onClocheLift: () => void;
  onOpenAIChef?: () => void;
  onCraftClick?: () => void;
  onOpenQRMenu?: () => void;
  onOpenLoyalty?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOrderClick,
  onReserveClick,
  onClocheLift,
  onOpenAIChef,
  onCraftClick,
  onOpenQRMenu,
  onOpenLoyalty,
}) => {
  return (
    <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 md:pt-20 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="max-w-3xl">
          {/* Refined Location & Schedule Badge (Sleek, Responsive, Anti-Congested) */}
          <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6 backdrop-blur-xs">
            <span className="inline-flex items-center gap-1.5 text-[#0189FE]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Phase 1, Hayatabad</span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>12:00 PM – 03:00 AM Daily</span>
            </span>
          </div>

          {/* Boutique Editorial Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.12] tracking-tight">
            Artisanal Crown Crust & Stone-Deck Baking
          </h1>

          {/* Subtitle with generous line height and calm tone */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
            Where Mediterranean periwinkle serenity meets eighteen hand-crimped mozzarella crown pockets. Slow 24-hour cold-fermented dough blistered at 450°C by master baker Faisal Khan Marwat in Hayatabad, Peshawar.
          </p>

          {/* Clean Action Buttons with Min 44px Height */}
          <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onOrderClick();
              }}
              className="min-h-[44px] px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
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
              className="min-h-[44px] px-5 sm:px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm bg-white dark:bg-[#131B2A] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
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
                className="min-h-[44px] px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                The Baking Craft →
              </button>
            )}
          </div>

          {/* Interactive Feature Pills (QR Code Menu & Loyalty Rewards) */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-2">
            {onOpenQRMenu && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  onOpenQRMenu();
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-slate-800 text-[#0189FE] dark:text-sky-300 border border-sky-200/60 dark:border-slate-700 hover:bg-sky-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Dine-In QR Menu</span>
              </button>
            )}

            {onOpenLoyalty && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  onOpenLoyalty();
                }}
                className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-slate-700 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Bunny Points Rewards</span>
              </button>
            )}
          </div>

          {/* Refined Trust Bar (Clean Responsive Layout) */}
          <div className="mt-10 pt-6 sm:pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-3 gap-3 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <div className="font-serif font-bold text-slate-900 dark:text-white text-base sm:text-lg">450°C</div>
              <span className="text-[11px] sm:text-xs">Volcanic Stone Deck</span>
            </div>
            <div>
              <div className="font-serif font-bold text-slate-900 dark:text-white text-base sm:text-lg">24h</div>
              <span className="text-[11px] sm:text-xs">Cold Fermentation</span>
            </div>
            <div>
              <div className="font-serif font-bold text-slate-900 dark:text-white text-base sm:text-lg">18</div>
              <span className="text-[11px] sm:text-xs">Cheese Crowns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
