import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config';
import { soundEffects } from '../utils/audio';
import { MessageCircle, ArrowRight, X, ChevronRight, ChevronLeft, Flame, Bike, Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  onOrderClick?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOrderClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const announcements = [
    {
      id: 1,
      badge: 'Open Now',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      headline: 'Stone-Deck Oven Baking Daily',
      details: '12:00 PM – 03:00 AM in Phase 1, Hayatabad',
      shortMobile: 'Open 12 PM – 3 AM Daily in Hayatabad',
      ctaText: 'Order Now',
      ctaAction: 'order',
    },
    {
      id: 2,
      badge: 'Free Delivery',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      headline: 'Free Doorstep Delivery in Peshawar',
      details: 'On all orders above Rs. 1,500',
      shortMobile: 'Free Peshawar Delivery on Rs. 1,500+',
      ctaText: 'Menu',
      ctaAction: 'order',
    },
    {
      id: 3,
      badge: 'WhatsApp',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      headline: 'Direct Kitchen WhatsApp Hotline',
      details: '+92 300 1234567 for orders & custom crusts',
      shortMobile: 'WhatsApp Orders: +92 300 1234567',
      ctaText: 'Chat',
      ctaAction: 'whatsapp',
    },
  ];

  // Auto-cycle announcements every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (!isVisible) return null;

  const current = announcements[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playPop();
    setIsVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label="Restaurant Announcements"
      className="relative z-50 w-full bg-[#0B132B] dark:bg-[#070D18] text-slate-200 border-b border-slate-800/80 shadow-xs select-none transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* ========================================================= */}
        {/* MOBILE VIEW (< 640px): Ultra-sleek, balanced, single-line */}
        {/* ========================================================= */}
        <div className="flex sm:hidden items-center justify-between min-h-[42px] py-1 gap-2">
          {/* Live indicator dot & rotating message */}
          <div
            onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
            className="flex-1 flex items-center gap-2 min-w-0 cursor-pointer"
          >
            {/* Pulsing indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>

            {/* Compact rotating text with smooth fade */}
            <div className="flex-1 min-w-0">
              <p
                key={current.id}
                className="text-[11px] font-medium leading-tight truncate text-slate-200 animate-in fade-in duration-200"
              >
                <span className="font-bold text-white mr-1.5">{current.badge}:</span>
                <span className="text-slate-300">{current.shortMobile}</span>
              </p>
            </div>
          </div>

          {/* Quick-action Touch Area (Min 44px hit-box for thumb) */}
          <div className="flex items-center shrink-0 -mr-1">
            <a
              href={`https://wa.me/${CONFIG.whatsappOrders || CONFIG.whatsapp}?text=Hello%20Bunny%20Bites%20Peshawar!`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] min-w-[44px] px-2 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 active:text-emerald-300 transition-colors cursor-pointer"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Dismiss control */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss announcement banner"
              className="min-h-[44px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP & TABLET VIEW (>= 640px): Spacious, refined bar   */}
        {/* ========================================================= */}
        <div className="hidden sm:flex items-center justify-between min-h-[40px] py-1.5 text-xs">
          {/* Left: Active Kitchen Status */}
          <div className="flex items-center gap-2.5 text-slate-400 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300 font-mono">
              Hayatabad Kitchen Active
            </span>
          </div>

          {/* Center: Rotating announcement with pagination controls */}
          <div className="flex items-center gap-2 max-w-xl mx-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous announcement"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              key={current.id}
              className="flex items-center gap-2 text-center text-xs animate-in fade-in duration-200"
            >
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${current.badgeColor}`}
              >
                {current.badge}
              </span>
              <span className="font-bold text-white">{current.headline}</span>
              <span className="text-slate-500" aria-hidden="true">·</span>
              <span className="text-slate-300 font-normal">{current.details}</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next announcement"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Direct WhatsApp Hotline & Close Button */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${CONFIG.whatsappOrders || CONFIG.whatsapp}?text=Hello%20Bunny%20Bites%20Peshawar!`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[32px] px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Hotline</span>
              <ArrowRight className="w-3 h-3 text-emerald-400 ml-0.5" />
            </a>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss announcement"
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
