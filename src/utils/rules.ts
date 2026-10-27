import { CartItem, OrderType, PromoCode } from '../types';

/**
 * Validates and normalizes Pakistani mobile numbers.
 * Accepts:
 *   - 03001234567 / 0300-1234567 / 0300 1234567
 *   - +923001234567 / +92 300 1234567 / 923001234567
 */
export function validatePakistaniPhone(phone: string): { isValid: boolean; normalized: string; formatted: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, normalized: '', formatted: '', error: 'Phone number is required' };
  }

  // Strip spaces, dashes, parentheses
  const digits = phone.replace(/[\s\-()]/g, '');

  let nationalDigits = '';

  if (digits.startsWith('+92')) {
    nationalDigits = '0' + digits.slice(3);
  } else if (digits.startsWith('92') && digits.length === 12) {
    nationalDigits = '0' + digits.slice(2);
  } else if (digits.startsWith('03')) {
    nationalDigits = digits;
  } else if (digits.startsWith('3') && digits.length === 10) {
    nationalDigits = '0' + digits;
  } else {
    return {
      isValid: false,
      normalized: digits,
      formatted: phone,
      error: 'Please enter a valid Pakistani mobile number starting with 03 (e.g. 0300 1234567)',
    };
  }

  // Must be 11 digits starting with 03
  const rx = /^03[0-9]{9}$/;
  if (!rx.test(nationalDigits)) {
    return {
      isValid: false,
      normalized: nationalDigits,
      formatted: phone,
      error: 'Pakistani mobile must have 11 digits starting with 03 (e.g. 0300 1234567)',
    };
  }

  // International format without + for WhatsApp
  const waFormat = '92' + nationalDigits.slice(1);
  const formatted = `${nationalDigits.slice(0, 4)}-${nationalDigits.slice(4)}`;

  return {
    isValid: true,
    normalized: nationalDigits,
    formatted,
  };
}

/**
 * Generates an Order ID in format BB-YYMMDD-001
 */
export function generateOrderId(dailyCount: number, date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const counterStr = String(dailyCount).padStart(3, '0');
  return `BB-${yy}${mm}${dd}-${counterStr}`;
}

/**
 * Generates Reservation Code in format BB-R-XXXX
 */
export function generateReservationCode(seed?: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const now = seed || Date.now();
  let n = now % (chars.length ** 4);
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BB-R-${code}`;
}

/**
 * Calculates Cart Item Total Price
 */
export function calculateItemTotal(item: CartItem): number {
  const base = item.selectedSize ? item.selectedSize.price : item.menuItem.price;
  const addOnsTotal = (item.selectedAddOns || []).reduce((sum, a) => sum + a.price, 0);
  return (base + addOnsTotal) * item.quantity;
}

/**
 * Order Pricing Calculation
 */
export interface PricingBreakdown {
  subtotal: number;
  deliveryFee: number;
  smallOrderFee: number;
  discount: number;
  loyaltyDiscount: number;
  tax: number;
  total: number;
  freeDeliveryThresholdDiff: number;
}

export function calculateOrderPricing(
  items: CartItem[],
  orderType: OrderType,
  promo: PromoCode | null,
  loyaltyPointsToRedeem: number,
  config: {
    deliveryFeeBase: number;
    freeDeliveryOver: number;
    smallOrderFeeThreshold: number;
    smallOrderFee: number;
    taxPercent: number;
  }
): PricingBreakdown {
  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  let deliveryFee = 0;
  let smallOrderFee = 0;

  if (orderType === 'delivery') {
    if (subtotal >= config.freeDeliveryOver) {
      deliveryFee = 0;
    } else {
      deliveryFee = config.deliveryFeeBase;
    }

    if (subtotal > 0 && subtotal < config.smallOrderFeeThreshold) {
      smallOrderFee = config.smallOrderFee;
    }
  }

  // Promo discount
  let discount = 0;
  if (promo && promo.isActive && subtotal >= promo.minOrder) {
    if (promo.type === 'percent') {
      discount = Math.round((subtotal * promo.value) / 100);
    } else {
      discount = Math.min(promo.value, subtotal);
    }
  }

  // Loyalty: 1 pt = Rs. 1 discount (max 50% of subtotal)
  const maxLoyaltyDiscount = Math.floor(subtotal * 0.5);
  const loyaltyDiscount = Math.min(loyaltyPointsToRedeem, maxLoyaltyDiscount);

  const taxableAmount = Math.max(0, subtotal - discount - loyaltyDiscount);
  const tax = config.taxPercent > 0 ? Math.round((taxableAmount * config.taxPercent) / 100) : 0;

  const total = Math.max(0, taxableAmount + deliveryFee + smallOrderFee + tax);
  const freeDeliveryThresholdDiff = Math.max(0, config.freeDeliveryOver - subtotal);

  return {
    subtotal,
    deliveryFee,
    smallOrderFee,
    discount,
    loyaltyDiscount,
    tax,
    total,
    freeDeliveryThresholdDiff,
  };
}

/**
 * Loyalty points earned for an order: 1 point per Rs. 100
 */
export function calculateLoyaltyPointsEarned(totalSpent: number): number {
  return Math.floor(totalSpent / 100);
}

/**
 * Checks if restaurant is currently open based on Peshawar time
 * Peshawar Hours: 12:00 PM to 03:00 AM
 */
export function isRestaurantOpen(date: Date = new Date()): { isOpen: boolean; message: string } {
  const hours = date.getHours();
  // 12:00 PM (12) to 03:00 AM (3)
  // Open if hours >= 12 OR hours < 3
  const isOpen = hours >= 12 || hours < 3;
  if (isOpen) {
    return { isOpen: true, message: 'Open now until 03:00 AM' };
  } else {
    return { isOpen: false, message: 'Opens today at 12:00 PM' };
  }
}

/**
 * Formats a clean, delightful WhatsApp text message for instant order confirmation
 */
export function formatWhatsAppOrderMessage(
  orderId: string,
  items: CartItem[],
  type: OrderType,
  pricing: PricingBreakdown,
  customer: {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
    tableNumber?: string;
  }
): string {
  const typeLabel = type === 'delivery' ? '🛵 DELIVERY' : type === 'pickup' ? '🛍️ PICKUP' : `🍽️ DINE-IN (Table #${customer.tableNumber || 'Pending'})`;

  let text = `🐰 *BUNNY BITES PESHAWAR - NEW ORDER*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📋 *Order ID:* ${orderId}\n`;
  text += `📍 *Type:* ${typeLabel}\n`;
  text += `👤 *Customer:* ${customer.name}\n`;
  text += `📞 *Phone:* ${customer.phone}\n`;

  if (type === 'delivery' && customer.address) {
    text += `🏠 *Address:* ${customer.address}\n`;
  }
  if (customer.notes) {
    text += `📝 *Notes:* ${customer.notes}\n`;
  }

  text += `\n🍕 *ITEMS ORDERED:*\n`;
  items.forEach((item, idx) => {
    const sizeName = item.selectedSize ? ` (${item.selectedSize.name})` : '';
    const addOnList = item.selectedAddOns?.length ? ` + ${item.selectedAddOns.map(a => a.name).join(', ')}` : '';
    const itemTotal = calculateItemTotal(item);
    text += `${idx + 1}. *${item.quantity}x* ${item.menuItem.name}${sizeName}${addOnList} - Rs. ${itemTotal.toLocaleString()}\n`;
    if (item.specialInstructions) {
      text += `   ↳ Note: _${item.specialInstructions}_\n`;
    }
  });

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Subtotal: Rs. ${pricing.subtotal.toLocaleString()}\n`;
  if (type === 'delivery') {
    text += `Delivery Fee: ${pricing.deliveryFee === 0 ? 'FREE' : `Rs. ${pricing.deliveryFee}`}\n`;
    if (pricing.smallOrderFee > 0) {
      text += `Small Order Fee: Rs. ${pricing.smallOrderFee}\n`;
    }
  }
  if (pricing.discount > 0) {
    text += `Promo Discount: -Rs. ${pricing.discount.toLocaleString()}\n`;
  }
  if (pricing.loyaltyDiscount > 0) {
    text += `Bunny Points Discount: -Rs. ${pricing.loyaltyDiscount.toLocaleString()}\n`;
  }
  text += `*TOTAL AMOUNT: Rs. ${pricing.total.toLocaleString()}* (Cash on Delivery)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Thank you for choosing Bunny Bites! Freshly baked with love in Hayatabad. 🐰✨`;

  return text;
}

export interface FloorTable {
  id: string; // T1 to T14
  name: string;
  zone: 'Cloud Booths' | 'Santorini Arches' | 'Bunny Center';
  zoneColor: string;
  seats: number;
}

export const RESTAURANT_TABLES: FloorTable[] = [
  // Velvet Cloud Booths (6 seats each)
  { id: 'T1', name: 'Booth A', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },
  { id: 'T2', name: 'Booth B', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },
  { id: 'T3', name: 'Booth C', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },
  { id: 'T4', name: 'Booth D', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },
  { id: 'T5', name: 'Booth E', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },
  { id: 'T6', name: 'Booth F', zone: 'Cloud Booths', zoneColor: '#2F5E9E', seats: 6 },

  // Santorini Periwinkle Arches (4 seats each)
  { id: 'T7', name: 'Arch 1', zone: 'Santorini Arches', zoneColor: '#648BC3', seats: 4 },
  { id: 'T8', name: 'Arch 2', zone: 'Santorini Arches', zoneColor: '#648BC3', seats: 4 },
  { id: 'T9', name: 'Arch 3', zone: 'Santorini Arches', zoneColor: '#648BC3', seats: 4 },
  { id: 'T10', name: 'Arch 4', zone: 'Santorini Arches', zoneColor: '#648BC3', seats: 4 },

  // Bunny Garden & Center (4 seats each)
  { id: 'T11', name: 'Center 1', zone: 'Bunny Center', zoneColor: '#0189FE', seats: 4 },
  { id: 'T12', name: 'Center 2', zone: 'Bunny Center', zoneColor: '#0189FE', seats: 4 },
  { id: 'T13', name: 'Bunny Corner 1', zone: 'Bunny Center', zoneColor: '#0189FE', seats: 4 },
  { id: 'T14', name: 'Bunny Corner 2', zone: 'Bunny Center', zoneColor: '#0189FE', seats: 4 },
];

export function getTableOccupancy(
  tables: FloorTable[],
  reservations: { id: string; date: string; time: string; partySize: number; status: string; customerName: string; tableNumber?: string }[],
  date: string,
  time: string
): Record<string, { isOccupied: boolean; reservationId?: string; reservedBy?: string }> {
  const result: Record<string, { isOccupied: boolean; reservationId?: string; reservedBy?: string }> = {};
  tables.forEach(t => {
    result[t.id] = { isOccupied: false };
  });

  const slotReservations = reservations.filter(
    r => r.date === date && r.time === time && r.status !== 'Cancelled'
  );

  const unassigned: typeof reservations = [];

  slotReservations.forEach(r => {
    if (r.tableNumber && result[r.tableNumber]) {
      result[r.tableNumber] = {
        isOccupied: true,
        reservationId: r.id,
        reservedBy: r.customerName,
      };
    } else {
      unassigned.push(r);
    }
  });

  // Assign any reservations without explicit table number to free tables
  unassigned.forEach(r => {
    const freeTable = tables.find(t => !result[t.id].isOccupied && t.seats >= r.partySize) ||
      tables.find(t => !result[t.id].isOccupied);
    if (freeTable) {
      result[freeTable.id] = {
        isOccupied: true,
        reservationId: r.id,
        reservedBy: r.customerName,
      };
    }
  });

  return result;
}
