import React, { useState } from 'react';
import { X, QrCode, Smartphone, Printer, Copy, Check, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { RESTAURANT_TABLES } from '../utils/rules';
import { soundEffects } from '../utils/audio';

interface QRCodeMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (category: string) => void;
}

export const QRCodeMenuModal: React.FC<QRCodeMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('T1');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentTable = RESTAURANT_TABLES.find(t => t.id === selectedTableId) || RESTAURANT_TABLES[0];
  const tableMenuUrl = `https://bunny-bites-hayatabad-peshawar.ai.studio/#menu?table=${selectedTableId}`;

  const handleCopy = () => {
    soundEffects.playPop();
    navigator.clipboard.writeText(tableMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundEffects.playPop();
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-menu-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0189FE] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="qr-menu-title" className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Dine-In Digital QR Menu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan from your table at Bunny Bites Hayatabad
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onClose();
            }}
            aria-label="Close QR menu modal"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Selector */}
        <div className="mt-5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
            Select Dining Table
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {RESTAURANT_TABLES.map(table => {
              const isSelected = table.id === selectedTableId;
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setSelectedTableId(table.id);
                  }}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0189FE] text-white shadow-md shadow-[#0189FE]/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {table.id} ({table.name})
                </button>
              );
            })}
          </div>
        </div>

        {/* Rendered QR Card View */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-b from-sky-50/60 to-white dark:from-slate-800/60 dark:to-slate-900 border border-sky-100 dark:border-slate-700 text-center flex flex-col items-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#0189FE] mb-1">
            Table Tent Stand
          </div>
          <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
            Table {currentTable.id} · {currentTable.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {currentTable.zone} · Seats up to {currentTable.seats} guests
          </p>

          {/* High-Contrast Crisp SVG QR Code */}
          <div className="my-5 p-4 rounded-2xl bg-white shadow-md border border-slate-200 inline-block">
            <svg viewBox="0 0 160 160" className="w-36 h-36 sm:w-44 sm:h-44 text-slate-900" fill="currentColor">
              {/* Corner 1 */}
              <rect x="10" y="10" width="40" height="40" rx="6" />
              <rect x="18" y="18" width="24" height="24" rx="2" fill="white" />
              <rect x="24" y="24" width="12" height="12" rx="2" />

              {/* Corner 2 */}
              <rect x="110" y="10" width="40" height="40" rx="6" />
              <rect x="118" y="18" width="24" height="24" rx="2" fill="white" />
              <rect x="124" y="24" width="12" height="12" rx="2" />

              {/* Corner 3 */}
              <rect x="10" y="110" width="40" height="40" rx="6" />
              <rect x="18" y="118" width="24" height="24" rx="2" fill="white" />
              <rect x="24" y="124" width="12" height="12" rx="2" />

              {/* Simulated Data Matrix Dots */}
              <rect x="60" y="15" width="8" height="8" rx="1" />
              <rect x="75" y="15" width="8" height="8" rx="1" />
              <rect x="90" y="15" width="8" height="8" rx="1" />
              <rect x="60" y="30" width="8" height="8" rx="1" />
              <rect x="85" y="30" width="8" height="8" rx="1" />

              <rect x="15" y="60" width="8" height="8" rx="1" />
              <rect x="30" y="60" width="8" height="8" rx="1" />
              <rect x="45" y="60" width="8" height="8" rx="1" />
              <rect x="60" y="60" width="8" height="8" rx="1" />
              <rect x="75" y="60" width="8" height="8" rx="1" />
              <rect x="105" y="60" width="8" height="8" rx="1" />
              <rect x="120" y="60" width="8" height="8" rx="1" />
              <rect x="135" y="60" width="8" height="8" rx="1" />

              {/* Bunny Center Icon Overlay */}
              <circle cx="80" cy="80" r="16" fill="white" />
              <circle cx="80" cy="80" r="14" fill="#0189FE" />
              <text x="80" y="86" fontSize="14" textAnchor="middle" fill="white">🐰</text>

              <rect x="15" y="85" width="8" height="8" rx="1" />
              <rect x="40" y="85" width="8" height="8" rx="1" />
              <rect x="110" y="85" width="8" height="8" rx="1" />
              <rect x="135" y="85" width="8" height="8" rx="1" />

              <rect x="60" y="105" width="8" height="8" rx="1" />
              <rect x="80" y="105" width="8" height="8" rx="1" />
              <rect x="95" y="105" width="8" height="8" rx="1" />
              <rect x="120" y="105" width="8" height="8" rx="1" />

              <rect x="60" y="125" width="8" height="8" rx="1" />
              <rect x="75" y="125" width="8" height="8" rx="1" />
              <rect x="105" y="125" width="8" height="8" rx="1" />
              <rect x="135" y="125" width="8" height="8" rx="1" />
              <rect x="85" y="140" width="8" height="8" rx="1" />
              <rect x="120" y="140" width="8" height="8" rx="1" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Smartphone className="w-4 h-4 text-[#0189FE]" />
            <span>Open phone camera to view full menu</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
            Directly browse 18-crown pizzas, crispy chicken, and chef combos right from your seat.
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Table Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Stand Card</span>
          </button>
        </div>

        {/* Quick Menu Jump */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Want to browse now?</span>
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onClose();
              const elem = document.getElementById('menu');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-bold text-[#0189FE] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Jump to Online Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
