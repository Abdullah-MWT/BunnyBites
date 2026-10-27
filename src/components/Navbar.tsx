import React, { useState } from 'react';
import { ShoppingBag, Volume2, VolumeX, Moon, Sun, Sparkles, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  nightTheme: boolean;
  onToggleNight: () => void;
  onScrollTo: (sectionId: string) => void;
  onBunnyEasterEgg?: () => void;
  onOpenAIChef?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  soundEnabled,
  onToggleSound,
  nightTheme,
  onToggleNight,
  onScrollTo,
  onBunnyEasterEgg,
  onOpenAIChef,
}) => {
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    soundEffects.playPop();
    const next = logoClicks + 1;
    if (next >= 3) {
      setLogoClicks(0);
      if (onBunnyEasterEgg) onBunnyEasterEgg();
    } else {
      setLogoClicks(next);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 backdrop-blur-md bg-white/95 dark:bg-[#0C121D]/95 border-b border-stone-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Refined Boutique Editorial) */}
        <div
          onClick={handleLogoClick}
          className="cursor-pointer group flex items-baseline gap-2.5 select-none shrink-0"
          title="Bunny Bites • Hayatabad, Peshawar"
        >
          <span className="font-serif text-2xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#0189FE] transition-colors whitespace-nowrap">
            Bunny Bites
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean">
            Hayatabad
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean Single-Line Typography) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => onScrollTo('signature-crown')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Crown Crust
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('cooking-craft')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            The Craft
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('menu')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Menu
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('deals')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Feast Deals
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('reservations')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Reservations
          </button>
          <button
            type="button"
            onClick={() => onScrollTo('track-order')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: Quiet Utility Controls & 1 Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenAIChef && (
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onOpenAIChef();
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Sommelier</span>
            </button>
          )}

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleSound();
              soundEffects.playPop();
            }}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Sound FX: On' : 'Sound FX: Off'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0189FE]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Night Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleNight();
              soundEffects.playPop();
            }}
            aria-label={nightTheme ? 'Switch to daylight' : 'Switch to evening atmosphere'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={nightTheme ? 'Daylight' : 'Evening Twilight'}
          >
            {nightTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onOpenCart();
            }}
            aria-label={`View order bag with ${cartCount} items`}
            className="relative px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#0189FE]" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="font-mono tabular-nums text-xs px-1.5 py-0.2 rounded-md bg-[#0189FE] text-white font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Primary Order Action */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onScrollTo('menu');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Order Online
          </button>
        </div>
      </div>
    </header>
  );
};
