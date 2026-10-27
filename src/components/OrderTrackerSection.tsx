import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { getStoredOrders } from '../store';
import { validatePakistaniPhone } from '../utils/rules';
import { soundEffects } from '../utils/audio';
import { Search, Bike, ChefHat, CheckCircle2, Clock, AlertCircle, FileText, Sparkles } from 'lucide-react';

interface OrderTrackerSectionProps {
  initialOrderId?: string;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'New', label: 'Order Received', icon: FileText },
  { status: 'Preparing', label: 'Baking & Prepping', icon: ChefHat },
  { status: 'Out for delivery', label: 'Out for Delivery / Ready', icon: Bike },
  { status: 'Completed', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTrackerSection: React.FC<OrderTrackerSectionProps> = ({ initialOrderId = '' }) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null);

  // Poll for live status changes every 3 seconds if an order is currently active
  useEffect(() => {
    if (!currentOrder) return;
    const interval = setInterval(() => {
      const orders = getStoredOrders();
      const match = orders.find(o => o.id === currentOrder.id);
      if (match && match.status !== currentOrder.status) {
        setCurrentOrder(match);
        soundEffects.playCartDing();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundMsg(null);
    soundEffects.playPop();

    const orders = getStoredOrders();
    const cleanId = orderIdInput.trim().toUpperCase();
    const phoneVal = validatePakistaniPhone(phoneInput);

    const match = orders.find(
      o => o.id.toUpperCase() === cleanId && (!phoneInput.trim() || o.customerPhone === phoneVal.normalized || o.customerPhone === phoneInput.trim())
    );

    if (match) {
      setCurrentOrder(match);
    } else {
      setCurrentOrder(null);
      setNotFoundMsg('No order found with this Order ID and phone number. Check your confirmation details.');
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'New': return 0;
      case 'Preparing': return 1;
      case 'Out for delivery':
      case 'Ready for pickup': return 2;
      case 'Completed': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const activeStepIdx = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <section id="track-order" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Kitchen Live Status · Delivery Dispatch
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Track Your Order
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Monitor your stone-deck pizza preparation and express delivery across Hayatabad, Peshawar.
        </p>
      </div>

      <div className="max-w-3xl mx-auto boutique-card p-6 md:p-8">
        {/* Lookup Form */}
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={orderIdInput}
            onChange={e => setOrderIdInput(e.target.value)}
            placeholder="Order ID (e.g. BB-261026-001)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-slate-500"
          />
          <input
            type="tel"
            value={phoneInput}
            onChange={e => setPhoneInput(e.target.value)}
            placeholder="Mobile Phone (0300... optional)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Track Order</span>
          </button>
        </form>

        {notFoundMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{notFoundMsg}</span>
          </div>
        )}

        {/* Live Stepper when order is found */}
        {currentOrder && (
          <div className="mt-8 pt-6 border-t border-stone-100 dark:border-slate-800">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[11px] text-stone-400 dark:text-slate-500 block uppercase tracking-wider font-sans-clean">
                  Order Reference
                </span>
                <span className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
                  {currentOrder.id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400 dark:text-slate-500 block uppercase tracking-wider font-sans-clean">
                  Estimated Arrival
                </span>
                <span className="font-mono tabular-nums text-sm font-semibold text-slate-900 dark:text-white">
                  ~{currentOrder.estimatedMinutes} Mins (Peshawar)
                </span>
              </div>
            </div>

            {/* Stepper Grid with Minimalist Vector Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              {STEPS.map((step, idx) => {
                const isPassed = activeStepIdx >= idx;
                const isCurrent = activeStepIdx === idx;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.status}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'border-slate-900 dark:border-white bg-stone-50 dark:bg-slate-850 shadow-xs'
                        : isPassed
                        ? 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-90'
                        : 'border-stone-100 dark:border-slate-800/60 opacity-40'
                    }`}
                  >
                    <div className="flex justify-center mb-1.5">
                      <StepIcon className={`w-5 h-5 ${isPassed ? 'text-[#0189FE]' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-900 dark:text-white leading-tight">
                      {step.label}
                    </div>
                    <div className="text-[10px] text-stone-400 dark:text-slate-500 mt-1 font-mono">
                      Step {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Itemized summary */}
            <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-slate-900/60 border border-stone-200/60 dark:border-slate-800/60 text-xs">
              <div className="font-semibold text-slate-900 dark:text-white mb-2">
                Order Summary ({currentOrder.type.toUpperCase()})
              </div>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                {currentOrder.items.map(ci => (
                  <li key={ci.cartItemId} className="flex justify-between font-mono">
                    <span>
                      {ci.quantity}x {ci.menuItem.name} {ci.selectedSize ? `(${ci.selectedSize.name})` : ''}
                    </span>
                    <span className="font-bold">Rs. {(ci.unitPrice * ci.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white font-mono">
                <span>Total Amount (COD)</span>
                <span>Rs. {currentOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
