import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { CONFIG } from '../config';
import { getStoredOrders } from '../store';
import { soundEffects } from '../utils/audio';
import {
  Search,
  Bike,
  Clock,
  CheckCircle2,
  Package,
  Flame,
  MessageCircle,
  MapPin,
  Phone,
  ChefHat,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

interface OrderTrackerSectionProps {
  initialOrderId?: string;
  orders?: Order[];
}

export const OrderTrackerSection: React.FC<OrderTrackerSectionProps> = ({
  initialOrderId = '',
  orders = [],
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync initialOrderId when redirected from cart
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
      findAndSetOrder(initialOrderId, '');
    }
  }, [initialOrderId]);

  const findAndSetOrder = (queryId: string, queryPhone: string) => {
    const allOrders = orders.length > 0 ? orders : getStoredOrders();
    const cleanId = queryId.trim().toUpperCase();
    const cleanPhone = queryPhone.replace(/[\s-]/g, '');

    let found = allOrders.find(o => o.id.toUpperCase() === cleanId);
    if (!found && cleanPhone) {
      found = allOrders.find(o => o.customerPhone.replace(/[\s-]/g, '').includes(cleanPhone));
    }

    // Default sample order if system just started
    if (!found && (!cleanId || cleanId === 'BB-261027-001' || cleanId === 'SAMPLE')) {
      found = {
        id: 'BB-261027-001',
        createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
        status: 'Preparing',
        type: 'delivery',
        customerName: 'Hamza Afridi',
        customerPhone: '03001234567',
        deliveryAddress: 'House 14, Street 4, Sector F-2, Phase 1, Hayatabad',
        items: [
          {
            cartItemId: 'sample-1',
            menuItem: {
              id: 'pizza-crown-signature',
              name: 'Signature Bunny Crown Crust',
              category: 'Crown Crust Pizza',
              price: 1950,
              description: '18 hand-crimped mozzarella cheese bumps',
              imageSvgType: 'crown-pizza',
              isBestseller: true,
            },
            quantity: 1,
            unitPrice: 1950,
            selectedSize: { name: 'Large 14"', price: 1950 },
            selectedAddOns: [],
          },
          {
            cartItemId: 'sample-2',
            menuItem: {
              id: 'drinks-blue-lagoon',
              name: 'Santorini Blue Lagoon',
              category: 'Shakes & Coolers',
              price: 380,
              description: 'Blue curaçao with mint and sparkling soda',
              imageSvgType: 'drink',
            },
            quantity: 2,
            unitPrice: 380,
            selectedAddOns: [],
          },
        ],
        subtotal: 2710,
        deliveryFee: 0,
        smallOrderFee: 0,
        discount: 0,
        loyaltyPointsUsed: 0,
        loyaltyDiscount: 0,
        total: 2710,
        estimatedMinutes: 35,
      };
    }

    if (found) {
      setActiveOrder(found);
      setSearchError(null);
    } else {
      setActiveOrder(null);
      setSearchError(`No order found matching "${queryId || queryPhone}". Please check your Order ID (e.g. BB-261027-001) or try searching by phone number.`);
    }
    setHasSearched(true);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playPop();
    findAndSetOrder(orderIdInput, phoneInput);
  };

  const steps = [
    {
      key: 'New',
      label: 'Order Confirmed',
      desc: 'Ticket received in kitchen & ingredients prepped',
      icon: ShoppingBag,
    },
    {
      key: 'Preparing',
      label: 'Dough Stretch & Stone Baking',
      desc: 'Hand-crimping 18 mozzarella crowns & baking at 450°C',
      icon: Flame,
    },
    {
      key: 'Out for delivery',
      label: activeOrder?.type === 'pickup' ? 'Ready at Counter' : 'Out for Delivery',
      desc: activeOrder?.type === 'pickup' ? 'Hot in thermal cloche' : 'Courier speeding across Peshawar',
      icon: Bike,
    },
    {
      key: 'Completed',
      label: activeOrder?.type === 'pickup' ? 'Picked Up' : 'Delivered & Shukriya',
      desc: 'Enjoy your hot Bunny Bites feast!',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 0;
      case 'Preparing':
        return 1;
      case 'Out for delivery':
      case 'Ready for pickup':
        return 2;
      case 'Completed':
        return 3;
      default:
        return 1;
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <section id="track-order" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Real-Time Dispatch
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Live Order Tracker
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Monitor your stone-deck pizzas, crispy chicken, and wings from oven stretch to delivery in Hayatabad.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Lookup Form */}
        <div className="boutique-card p-6 md:p-8">
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="track-order-id" className="sr-only">
                Order ID
              </label>
              <input
                id="track-order-id"
                type="text"
                value={orderIdInput}
                onChange={e => setOrderIdInput(e.target.value)}
                placeholder="Order ID (e.g. BB-261027-001)"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="track-phone" className="sr-only">
                Mobile Phone
              </label>
              <input
                id="track-phone"
                type="tel"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder="Mobile (0300 1234567)"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            <button
              type="submit"
              className="min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Track Live Order</span>
            </button>
          </form>

          {/* Quick preset suggestion */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Try sample order:</span>
            <button
              type="button"
              onClick={() => {
                setOrderIdInput('BB-261027-001');
                findAndSetOrder('BB-261027-001', '');
              }}
              className="font-mono text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0189FE] cursor-pointer"
            >
              BB-261027-001
            </button>
          </div>

          {searchError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Live Active Order Status Card */}
        {activeOrder && (
          <div className="boutique-card p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header / Info Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                    {activeOrder.id}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-[#0189FE] dark:bg-sky-950 dark:text-sky-300">
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Placed for <strong>{activeOrder.customerName}</strong> ({activeOrder.customerPhone}) · {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Estimated Arrival
                </span>
                <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {activeOrder.type === 'delivery' ? '30–40 Mins' : '15–20 Mins'}
                </span>
              </div>
            </div>

            {/* Stepper Progress Visualizer */}
            <div className="py-2">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-stone-200 dark:bg-slate-800 -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-[#0189FE] to-emerald-500 transition-all duration-700"
                    style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-5 gap-2 relative z-10">
                  {steps.map((st, idx) => {
                    const isDone = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const Icon = st.icon;

                    return (
                      <div key={st.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-md'
                              : isCurrent
                              ? 'bg-[#0189FE] text-white ring-4 ring-sky-200 dark:ring-sky-900 shadow-lg scale-110'
                              : 'bg-stone-200 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <span
                          className={`mt-3 text-[11px] sm:text-xs font-bold leading-tight ${
                            isCurrent
                              ? 'text-slate-900 dark:text-white'
                              : isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {st.label}
                        </span>

                        <span className="hidden md:block mt-1 text-[10px] text-slate-400 dark:text-slate-500 max-w-[120px] leading-tight">
                          {st.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100 dark:border-slate-800">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Items In Ticket
                </h4>
                <div className="space-y-2">
                  {activeOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {it.quantity}x {it.menuItem.name}
                        </span>
                        {it.selectedSize && (
                          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                            Portion: {it.selectedSize.name}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {(it.unitPrice * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination & WhatsApp Help */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/60 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-[#0189FE] shrink-0 mt-0.5" />
                    <span>
                      {activeOrder.type === 'delivery'
                        ? activeOrder.deliveryAddress || 'Hayatabad, Peshawar'
                        : `Dine-In Table #${activeOrder.tableNumber || 'Main Floor'}`}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-slate-800">
                    <span className="text-slate-500">Payment:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      Rs. {activeOrder.total.toLocaleString()} (Cash on Delivery)
                    </strong>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${CONFIG.whatsappOrders}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum! Inquiring on status of Order #${activeOrder.id} for ${activeOrder.customerName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact WhatsApp Kitchen Dispatch</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
