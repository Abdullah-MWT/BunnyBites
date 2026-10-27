import React, { useState } from 'react';
import {
  ShoppingBag,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  QrCode,
  Award,
  UtensilsCrossed,
  CalendarCheck,
  Search,
  Compass,
  MapPin,
  Clock,
} from 'lucide-react';
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
  onOpenQRMenu?: () => void;
  onOpenLoyalty?: () => void;
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
  onOpenQRMenu,
  onOpenLoyalty,
}) => {
  const [logoClicks, setLogoClicks] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (sectionId: string) => {
    soundEffects.playPop();
    setMobileMenuOpen(false);
    onScrollTo(sectionId);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-md bg-white/95 dark:bg-[#0C121D]/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Wordmark */}
          <div
            onClick={handleLogoClick}
            className="cursor-pointer group flex items-baseline gap-2 select-none shrink-0"
            title="Bunny Bites • Hayatabad, Peshawar"
          >
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[#0189FE] transition-colors whitespace-nowrap">
              Bunny Bites
            </span>
            <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-sans-clean">
              Hayatabad
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => handleNavClick('signature-crown')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Crown Crust
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('cooking-craft')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              The Craft
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('menu')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('deals')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Feast Deals
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('reservations')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Reservations
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('track-order')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Track Order
            </button>
          </nav>

          {/* Utility Controls & Order Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Sommelier (Desktop) */}
            {onOpenAIChef && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playPop();
                  onOpenAIChef();
                }}
                className="hidden xl:inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={nightTheme ? 'Daylight' : 'Evening Twilight'}
            >
              {nightTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </button>

            {/* Cart Bag Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                onOpenCart();
              }}
              aria-label={`View order bag with ${cartCount} items`}
              className="min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs font-semibold cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#0189FE]" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="font-mono tabular-nums text-xs px-1.5 py-0.5 rounded-md bg-[#0189FE] text-white font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop Only Primary Order Button (Hidden on mobile to eliminate overflow!) */}
            <button
              type="button"
              onClick={() => handleNavClick('menu')}
              className="hidden md:inline-flex min-h-[44px] items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Order Online
            </button>

            {/* Mobile Hamburger Toggle Button (min 44px tap target) */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden w-11 h-11 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 lg:hidden flex flex-col bg-white/98 dark:bg-[#0C121D]/98 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                Bunny Bites
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#0189FE] text-white">
                Hayatabad
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEffects.playPop();
                setMobileMenuOpen(false);
              }}
              aria-label="Close navigation"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Body Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
            {/* Primary Order Action Button inside Drawer */}
            <button
              type="button"
              onClick={() => handleNavClick('menu')}
              className="w-full min-h-[48px] rounded-2xl bg-[#0189FE] hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0189FE]/20 transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Explore Menu & Order Online</span>
            </button>

            {/* Core Sections */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3 mb-1">
                Explore Restaurant
              </span>

              <button
                type="button"
                onClick={() => handleNavClick('signature-crown')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>👑 Signature Crown Crust</span>
                <span className="text-xs text-slate-400">3D Exploder</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('cooking-craft')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🔥 The Artisan Craft</span>
                <span className="text-xs text-slate-400">Faisal Khan Marwat</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('deals')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🎁 Family Feast Deals</span>
                <span className="text-xs text-emerald-500 font-bold">Save 20%</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('reservations')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🪑 Table Reservations</span>
                <span className="text-xs text-slate-400">Floor Plan</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('track-order')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>📍 Track Order</span>
                <span className="text-xs text-slate-400">Status</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('our-space')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🏛️ The Santorini Space</span>
                <span className="text-xs text-slate-400">Architecture</span>
              </button>
            </div>

            {/* Interactive Dining Tools */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3 mb-1">
                Guest Services
              </span>

              {onOpenQRMenu && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setMobileMenuOpen(false);
                    onOpenQRMenu();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-sky-200 dark:border-slate-700 bg-sky-50/50 dark:bg-slate-800 text-left font-semibold text-xs text-[#0189FE] dark:text-sky-300 flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>Dine-In Table QR Code Menu</span>
                </button>
              )}

              {onOpenLoyalty && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setMobileMenuOpen(false);
                    onOpenLoyalty();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800 text-left font-semibold text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Bunny Points Loyalty Tracker</span>
                </button>
              )}

              {onOpenAIChef && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setMobileMenuOpen(false);
                    onOpenAIChef();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-slate-700 bg-purple-50/50 dark:bg-slate-800 text-left font-semibold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-purple-500" />
                  <span>Ask AI Sommelier & Pizza Chef</span>
                </button>
              )}
            </div>

            {/* Quick Location & Hours Footnote */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0189FE]" />
                <span>Phase 1, Hayatabad, Peshawar</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>12:00 PM – 03:00 AM Daily</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
