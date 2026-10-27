import React, { useState, useEffect } from 'react';
import { CartItem, OrderType, PromoCode, Order } from '../types';
import { CONFIG } from '../config';
import {
  calculateOrderPricing,
  calculateItemTotal,
  validatePakistaniPhone,
  generateOrderId,
  formatWhatsAppOrderMessage,
  calculateLoyaltyPointsEarned,
} from '../utils/rules';
import { getCustomerLoyalty, addCustomerLoyalty, getNextDailyOrderCount } from '../store';
import { soundEffects } from '../utils/audio';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Bike,
  Store,
  Utensils,
  CheckCircle2,
  MessageCircle,
  Copy,
  AlertCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  promos: PromoCode[];
  onOrderPlaced: (order: Order) => void;
  onTrackOrder: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  promos,
  onOrderPlaced,
  onTrackOrder,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [tableNumber, setTableNumber] = useState<string>('');

  // Checkout inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Promo code & Loyalty
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [loyaltyBalance, setLoyaltyBalance] = useState<number>(0);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Update loyalty balance whenever phone number updates
  useEffect(() => {
    const val = validatePakistaniPhone(customerPhone);
    if (val.isValid) {
      const balance = getCustomerLoyalty(val.normalized);
      setLoyaltyBalance(balance);
    } else {
      setLoyaltyBalance(0);
      setLoyaltyPointsToRedeem(0);
    }
  }, [customerPhone]);

  // Pricing breakdown calculation
  const pricing = calculateOrderPricing(
    cart,
    orderType,
    appliedPromo,
    loyaltyPointsToRedeem,
    {
      deliveryFeeBase: CONFIG.deliveryFeeBase,
      freeDeliveryOver: CONFIG.freeDeliveryOver,
      smallOrderFeeThreshold: CONFIG.smallOrderFeeThreshold,
      smallOrderFee: CONFIG.smallOrderFee,
      taxPercent: CONFIG.taxPercent,
    }
  );

  const handleApplyPromo = () => {
    soundEffects.playPop();
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    const match = promos.find(p => p.code.toUpperCase() === code && p.isActive);

    if (!match) {
      setPromoError('Invalid promo code. Try BUNNY10 or FIRSTBITE.');
      return;
    }

    if (pricing.subtotal < match.minOrder) {
      setPromoError(`This promo requires a minimum order of Rs. ${match.minOrder.toLocaleString()}.`);
      return;
    }

    setAppliedPromo(match);
    soundEffects.playCartDing();
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    setCheckoutError(null);

    if (cart.length === 0) {
      setCheckoutError('Your cart is empty!');
      return;
    }

    // Minimum order enforcement
    if (pricing.subtotal < CONFIG.minOrder) {
      setCheckoutError(`Minimum order amount is Rs. ${CONFIG.minOrder}. Please add more delicious items!`);
      return;
    }

    // Validate Pakistani Phone
    const phoneVal = validatePakistaniPhone(customerPhone);
    if (!phoneVal.isValid) {
      setCheckoutError(phoneVal.error || 'Please enter a valid Pakistani mobile number.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setCheckoutError('Please enter your full delivery address in Peshawar.');
      return;
    }

    soundEffects.playCartDing();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const dailyCount = getNextDailyOrderCount();
      const newOrderId = generateOrderId(dailyCount);
      const newOrder: Order = {
        id: newOrderId,
        createdAt: new Date().toISOString(),
        status: 'New',
        type: orderType,
        tableNumber: orderType === 'dinein' ? tableNumber : undefined,
        customerName: customerName.trim(),
        customerPhone: phoneVal.normalized,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        deliveryLandmark: orderType === 'delivery' ? deliveryLandmark.trim() : undefined,
        notes: orderNotes.trim() || undefined,
        items: [...cart],
        subtotal: pricing.subtotal,
        deliveryFee: pricing.deliveryFee,
        smallOrderFee: pricing.smallOrderFee,
        discount: pricing.discount,
        promoCode: appliedPromo?.code,
        loyaltyPointsUsed: loyaltyPointsToRedeem,
        loyaltyDiscount: pricing.loyaltyDiscount,
        total: pricing.total,
        estimatedMinutes: orderType === 'delivery' ? 40 : 20,
      };

      // Real persistent order placement
      onOrderPlaced(newOrder);
      addCustomerLoyalty(
        phoneVal.normalized,
        calculateLoyaltyPointsEarned(pricing.total),
        loyaltyPointsToRedeem
      );
      onClearCart();
      setCompletedOrder(newOrder);
      soundEffects.playFanfare();
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }, 400);
  };

  const handleCopyOrder = () => {
    if (!completedOrder) return;
    const msg = formatWhatsAppOrderMessage(
      completedOrder.id,
      completedOrder.items,
      completedOrder.type,
      {
        subtotal: completedOrder.subtotal,
        deliveryFee: completedOrder.deliveryFee,
        smallOrderFee: completedOrder.smallOrderFee,
        discount: completedOrder.discount,
        loyaltyDiscount: completedOrder.loyaltyDiscount,
        tax: 0,
        total: completedOrder.total,
        freeDeliveryThresholdDiff: 0,
      },
      {
        name: completedOrder.customerName,
        phone: completedOrder.customerPhone,
        address: completedOrder.deliveryAddress,
        notes: completedOrder.notes,
        tableNumber: completedOrder.tableNumber,
      }
    );

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#131B2A] h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#0189FE]" />
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              Your Order Bag
            </h3>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Freshness & Kitchen Guarantee Banner */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs font-medium text-center flex items-center justify-center gap-2">
            <span>🍕</span>
            <span>Stone-deck baked fresh to order in Hayatabad · Cash on Delivery</span>
          </div>

          {completedOrder ? (
            /* Real Order Placed Confirmation View */
            <div role="status" aria-live="polite" className="py-6 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
                ✓
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Order Successfully Created
                </span>
                <h4 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Shukriya, {completedOrder.customerName}!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your order has been sent to Master Baker Faisal Khan Marwat & the kitchen team in Hayatabad.
                </p>
              </div>

              {/* Order ID & Estimated Time Badge */}
              <div className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Order Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#0189FE]">
                      {completedOrder.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrder}
                      aria-label="Copy order receipt"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Time:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {completedOrder.type === 'delivery' ? '35–45 minutes' : '20–25 minutes'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total to Pay (COD):</span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                    Rs. {completedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 1-Click Send Order via WhatsApp */}
              <div className="w-full space-y-2 pt-2">
                <a
                  href={`https://wa.me/${CONFIG.whatsappOrders}?text=${encodeURIComponent(
                    formatWhatsAppOrderMessage(
                      completedOrder.id,
                      completedOrder.items,
                      completedOrder.type,
                      {
                        subtotal: completedOrder.subtotal,
                        deliveryFee: completedOrder.deliveryFee,
                        smallOrderFee: completedOrder.smallOrderFee,
                        discount: completedOrder.discount,
                        loyaltyDiscount: completedOrder.loyaltyDiscount,
                        tax: 0,
                        total: completedOrder.total,
                        freeDeliveryThresholdDiff: 0,
                      },
                      {
                        name: completedOrder.customerName,
                        phone: completedOrder.customerPhone,
                        address: completedOrder.deliveryAddress,
                        notes: completedOrder.notes,
                        tableNumber: completedOrder.tableNumber,
                      }
                    )
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order Receipt to WhatsApp Kitchen</span>
                </a>

                {/* Track Order Live Button */}
                <button
                  type="button"
                  onClick={() => {
                    onTrackOrder(completedOrder.id);
                    onClose();
                  }}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bike className="w-4 h-4 text-[#0189FE]" />
                  <span>Track Live Order Status</span>
                </button>
              </div>

              {copiedText && (
                <p className="text-[11px] text-emerald-600 font-semibold">
                  ✓ Order details copied to clipboard!
                </p>
              )}
            </div>
          ) : (
            /* Cart Items & Checkout Flow */
            <>
              {/* Order Type Tabs */}
              <div className="flex rounded-2xl p-1 bg-gray-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    orderType === 'delivery'
                      ? 'bg-[#0189FE] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    orderType === 'pickup'
                      ? 'bg-[#0189FE] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Pickup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('dinein')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    orderType === 'dinein'
                      ? 'bg-[#0189FE] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Dine-In</span>
                </button>
              </div>

              {/* Free Delivery Progress Bar */}
              {orderType === 'delivery' && (
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-[#8DBCE8]/40">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#2F5E9E] dark:text-sky-300">
                      {pricing.freeDeliveryThresholdDiff === 0
                        ? '🎉 You unlocked FREE Delivery!'
                        : `Add Rs. ${pricing.freeDeliveryThresholdDiff.toLocaleString()} more for FREE delivery`}
                    </span>
                    <span className="text-gray-500">Goal: Rs. {CONFIG.freeDeliveryOver}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0189FE] to-[#F5C45E] transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (pricing.subtotal / CONFIG.freeDeliveryOver) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl">🐰🍕</span>
                  <p className="font-bold text-sm text-[#2F5E9E] dark:text-gray-300 mt-2">
                    Your feast cart is empty!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Add a hand-pinched Crown Crust or crispy chicken box to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => {
                    const itemTotal = calculateItemTotal(item);
                    return (
                      <div
                        key={item.cartItemId}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="flex-1">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[#2F5E9E] dark:text-white">
                            {item.menuItem.name}
                          </h4>
                          {item.selectedSize && (
                            <span className="text-[11px] font-bold text-[#0189FE] block">
                              Size: {item.selectedSize.name}
                            </span>
                          )}
                          {item.selectedAddOns?.length > 0 && (
                            <span className="text-[10px] text-gray-500 block">
                              + {item.selectedAddOns.map(a => a.name).join(', ')}
                            </span>
                          )}
                          {item.specialInstructions && (
                            <span className="text-[10px] text-amber-700 italic block mt-0.5">
                              Note: {item.specialInstructions}
                            </span>
                          )}
                          <div className="text-xs font-black text-[#0189FE] mt-1">
                            Rs. {itemTotal.toLocaleString()}
                          </div>
                        </div>

                        {/* Quantity Stepper & Remove */}
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.cartItemId)}
                            className="text-gray-400 hover:text-rose-500 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                              className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                              className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Promo Code Input */}
              {cart.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-[#8DBCE8]/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F5E9E] dark:text-sky-300 mb-2">
                    <Tag className="w-3.5 h-3.5 text-[#0189FE]" />
                    <span>Have a Promo Code?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      placeholder="e.g. BUNNY10 / FIRSTBITE"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 text-xs uppercase focus:ring-2 focus:ring-[#0189FE]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-1.5 rounded-xl font-bold text-xs bg-[#2F5E9E] text-white hover:bg-[#0189FE] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span>✓ Applied {appliedPromo.code}: {appliedPromo.description}</span>
                    </div>
                  )}
                  {promoError && (
                    <div className="mt-2 text-xs font-bold text-rose-500">
                      {promoError}
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details Form */}
              {cart.length > 0 && (
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#2F5E9E] dark:text-sky-300">
                    Customer Information (COD)
                  </h4>

                  {checkoutError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Your Name *"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                    />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Pakistani Phone (0300...)*"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                    />
                  </div>

                  {/* Loyalty Points notification if balance > 0 */}
                  {loyaltyBalance > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-800 dark:text-amber-200">
                          🥕 Bunny Points: {loyaltyBalance} pts
                        </span>
                        <span className="text-[10px] text-gray-500 block">
                          (Redeem up to Rs. {Math.min(loyaltyBalance, Math.floor(pricing.subtotal * 0.5))})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const maxRedeem = Math.min(loyaltyBalance, Math.floor(pricing.subtotal * 0.5));
                          setLoyaltyPointsToRedeem(loyaltyPointsToRedeem > 0 ? 0 : maxRedeem);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white"
                      >
                        {loyaltyPointsToRedeem > 0 ? 'Remove' : 'Redeem'}
                      </button>
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        placeholder="Delivery Address (House #, Street, Phase in Hayatabad) *"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                      />
                      <input
                        type="text"
                        value={deliveryLandmark}
                        onChange={e => setDeliveryLandmark(e.target.value)}
                        placeholder="Nearby Landmark (e.g. Near Bilal Market / Tatara Park)"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                      />
                    </>
                  )}

                  {orderType === 'dinein' && (
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="Table Number (Optional / If already seated)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                    />
                  )}

                  <input
                    type="text"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    placeholder="Rider instructions / doorbell notes (optional)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-[#0189FE]"
                  />
                </form>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {!completedOrder && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#8DBCE8]/30 bg-gray-50/80 dark:bg-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span className="font-bold">Rs. {pricing.subtotal.toLocaleString()}</span>
            </div>

            {orderType === 'delivery' && (
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery Fee:</span>
                <span className="font-bold">
                  {pricing.deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-black">FREE</span>
                  ) : (
                    `Rs. ${pricing.deliveryFee}`
                  )}
                </span>
              </div>
            )}

            {pricing.smallOrderFee > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Small Order Fee:</span>
                <span>Rs. {pricing.smallOrderFee}</span>
              </div>
            )}

            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promo Discount ({appliedPromo?.code}):</span>
                <span>-Rs. {pricing.discount.toLocaleString()}</span>
              </div>
            )}

            {pricing.loyaltyDiscount > 0 && (
              <div className="flex justify-between text-amber-600 font-bold">
                <span>Bunny Points Discount:</span>
                <span>-Rs. {pricing.loyaltyDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between font-black text-base text-[#0189FE] dark:text-sky-400">
              <span>Total (Cash on Delivery):</span>
              <span>Rs. {pricing.total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-3.5 px-4 rounded-xl font-bold text-sm bg-[#0189FE] hover:bg-[#0170d0] text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Place Cash on Delivery Order'}</span>
              <span>👉</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
