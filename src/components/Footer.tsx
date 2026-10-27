import React from 'react';
import { CONFIG } from '../config';
import { soundEffects } from '../utils/audio';
import { QrCode, Award, ArrowUp, Sparkles, MapPin, Clock } from 'lucide-react';

interface FooterProps {
  onScrollTo: (sectionId: string) => void;
  onOpenQRMenu?: () => void;
  onOpenLoyalty?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollTo,
  onOpenQRMenu,
  onOpenLoyalty,
}) => {
  const scrollToTop = () => {
    soundEffects.playPop();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Freshness Promise & Direct WhatsApp Banner */}
        <div className="mb-12 p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40 text-sky-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <span className="text-2xl">🍕</span>
            <div>
              <strong className="font-bold text-white block text-sm">Bunny Bites Freshness Promise</strong>
              <span className="text-slate-300">100% Mozzarella, 24-hour slow fermented dough, and hot delivery straight to your doorstep across Peshawar.</span>
            </div>
          </div>
          <a
            href={`https://wa.me/${CONFIG.whatsappOrders}?text=Hello%20Bunny%20Bites%20Peshawar!%20I%20would%20like%20to%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#0189FE] hover:bg-[#0170d0] text-white font-bold text-xs transition-colors shrink-0 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Direct WhatsApp Order</span>
            <span>→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Bunny Bites
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#0189FE] text-white">
                Hayatabad
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Santorini sunset aesthetics, 18 hand-crimped mozzarella crown crusts, and warm Peshawari hospitality. Founded by master baker Faisal Khan Marwat.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0189FE] shrink-0" />
                <span>Phase 1, Hayatabad, Peshawar, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Daily 12:00 PM – 03:00 AM (Late Night Spot)</span>
              </div>
            </div>
          </div>

          {/* Quick Dining Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans-clean">
              Explore Dining
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('signature-crown')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Crown Crust 3D
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('cooking-craft')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  The Baking Craft
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('menu')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Full Restaurant Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('deals')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Family Feast Combos
                </button>
              </li>
            </ul>
          </div>

          {/* Guest Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans-clean">
              Guest Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('reservations')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Book a Table & Floor Plan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('track-order')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('our-space')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Santorini Space & Arches
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onScrollTo('faq-contact')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Visit Us & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Interactive Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans-clean">
              Digital Dining Tools
            </h4>
            <div className="space-y-2 text-xs">
              {onOpenQRMenu && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    onOpenQRMenu();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer text-left"
                >
                  <QrCode className="w-4 h-4 text-[#0189FE]" />
                  <span>Dine-In QR Code Menu</span>
                </button>
              )}

              {onOpenLoyalty && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    onOpenLoyalty();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2 cursor-pointer text-left"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Bunny Points Tracker</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Credits & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Bunny Bites Peshawar. Crafted with artisan care in Hayatabad.</p>
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
