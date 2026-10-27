import React, { useState } from 'react';
import { X, Award, Sparkles, Gift, ArrowRight, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import { validatePakistaniPhone } from '../utils/rules';

interface LoyaltyTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyTrackerModal: React.FC<LoyaltyTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('0300 1234567');
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [points, setPoints] = useState<number>(240);
  const [customerName, setCustomerName] = useState<string>('Hamza Afridi');

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playPop();

    const clean = phoneNumber.replace(/[\s-]/g, '');
    if (clean.length < 10) return;

    // Deterministic simulation based on last digits
    const lastDigits = parseInt(clean.slice(-3), 10) || 123;
    const computedPoints = (lastDigits * 3) % 450 + 50;

    setPoints(computedPoints);
    setCustomerName('Loyal Guest (' + clean.slice(-4) + ')');
    setHasSearched(true);
  };

  const getTier = (pts: number) => {
    if (pts >= 500) {
      return {
        name: 'Golden Rabbit',
        badge: '👑',
        color: 'from-amber-400 to-yellow-600',
        nextTier: 'Max Tier Achieved!',
        nextPts: 0,
        perk: '20% off all dine-in + Free dessert on every visit',
      };
    }
    if (pts >= 200) {
      return {
        name: 'Silver Hare',
        badge: '🥈',
        color: 'from-sky-400 to-blue-600',
        nextTier: 'Golden Rabbit',
        nextPts: 500 - pts,
        perk: 'Free Garlic Mayo Dip + Priority table reservations',
      };
    }
    return {
      name: 'Bronze Bunny',
      badge: '🥉',
      color: 'from-amber-700 to-amber-900',
      nextTier: 'Silver Hare',
      nextPts: 200 - pts,
      perk: '1 Bunny Point for every Rs. 100 spent',
    };
  };

  const tier = getTier(points);
  const progressPercent = Math.min(100, Math.round((points / 500) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="loyalty-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 id="loyalty-title" className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Bunny Points & Rewards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Earn 1 Point per Rs. 100 spent on pizzas, chicken & deals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              onClose();
            }}
            aria-label="Close loyalty tracker"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Phone Number Form */}
        <form onSubmit={handleLookup} className="mt-5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
            Enter Pakistani Phone Number
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="0300 1234567"
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0189FE] outline-hidden text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0189FE] hover:bg-blue-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Check Points
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tip: Use default <code>0300 1234567</code> to explore sample rewards.
          </p>
        </form>

        {/* Member Card */}
        {hasSearched && (
          <div className="mt-6 p-6 rounded-3xl bg-slate-900 text-white border border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Club Member
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-0.5">{customerName}</h4>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center gap-1.5 text-amber-300">
                <span>{tier.badge}</span>
                <span>{tier.name}</span>
              </div>
            </div>

            {/* Points Balance */}
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-serif text-4xl sm:text-5xl font-extrabold text-[#F5C45E] tracking-tight">
                {points}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Bunny Points
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-semibold">
                <span>Tier Milestone</span>
                <span>{progressPercent}% to next tier</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0189FE] to-[#F5C45E] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {tier.nextPts > 0 ? (
                <p className="text-[11px] text-sky-300 mt-1.5">
                  ✨ Earn {tier.nextPts} more points to reach <strong>{tier.nextTier}</strong>!
                </p>
              ) : (
                <p className="text-[11px] text-amber-300 mt-1.5 font-bold">
                  👑 VIP status active! Enjoy maximum restaurant perks.
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Current Perk: {tier.perk}</span>
            </div>
          </div>
        )}

        {/* Redemption Milestones */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Available Rewards to Redeem
          </h4>

          <div className="space-y-2">
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  50p
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Rs. 250 Off Entire Bag</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Valid on any order above Rs. 1,000</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${points >= 50 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {points >= 50 ? 'Unlocked ✓' : '50 Pts'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0189FE] flex items-center justify-center font-bold text-xs">
                  100p
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Rs. 600 Off + Garlic Mayo Dip</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Valid on any order above Rs. 2,000</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${points >= 100 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {points >= 100 ? 'Unlocked ✓' : '100 Pts'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center font-bold text-xs">
                  250p
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Free Medium Crown Crust Pizza</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Any flavor of your choice</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${points >= 250 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {points >= 250 ? 'Unlocked ✓' : '250 Pts'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Points are automatically added to your phone number on every delivery, takeaway or dine-in bill.
        </div>
      </div>
    </div>
  );
};
