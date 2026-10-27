import { CONFIG, INITIAL_MENU, INITIAL_COMBOS, INITIAL_PROMOS, INITIAL_REVIEWS } from '../config';
import {
  MenuItem,
  Order,
  TableReservation,
  CustomerReview,
  PromoCode,
  CartItem,
  OrderStatus,
} from '../types';

// In-memory fallback map
const memoryStore: Record<string, string> = {};

class SafeStore {
  private prefix = 'bb:';

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && (window as any).storage) {
        return (window as any).storage;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        // Test write to make sure it's not blocked in incognito/iframes
        const testKey = '__bb_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch {
      // Storage blocked or unavailable
    }
    return null;
  }

  getItem<T>(key: string, defaultValue: T): T {
    const fullKey = this.prefix + key;
    try {
      const storage = this.getStorage();
      const raw = storage ? storage.getItem(fullKey) : memoryStore[fullKey];
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading from storage for key', fullKey, e);
    }
    return defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    const fullKey = this.prefix + key;
    try {
      const str = JSON.stringify(value);
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(fullKey, str);
      } else {
        memoryStore[fullKey] = str;
      }
      // Dispatch custom local event so multiple components / same tab update immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bb:storage_change', { detail: { key, value } }));
      }
    } catch (e) {
      console.warn('Error writing to storage for key', fullKey, e);
      try {
        memoryStore[fullKey] = JSON.stringify(value);
      } catch {}
    }
  }

  removeItem(key: string): void {
    const fullKey = this.prefix + key;
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(fullKey);
      }
      delete memoryStore[fullKey];
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bb:storage_change', { detail: { key, value: null } }));
      }
    } catch (e) {
      console.warn('Error removing from storage', fullKey, e);
    }
  }
}

export const store = new SafeStore();

// Storage Keys
export const STORAGE_KEYS = {
  MENU: 'menu_items',
  COMBOS: 'combos',
  ORDERS: 'orders',
  ORDER_COUNTER: 'order_daily_counter',
  RESERVATIONS: 'reservations',
  REVIEWS: 'reviews',
  PROMOS: 'promos',
  CART: 'active_cart',
  FAVORITES: 'favorite_ids',
  RECENTLY_VIEWED: 'recently_viewed_ids',
  LOYALTY: 'loyalty_accounts', // Record<phone, points>
  SETTINGS: 'app_settings',
  SOUND_ENABLED: 'sound_enabled',
  THEME_NIGHT: 'theme_night',
  CONTACT_MESSAGES: 'contact_messages',
};

// High-level store operations
export function getStoredMenu(): MenuItem[] {
  return store.getItem<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU);
}

export function saveStoredMenu(items: MenuItem[]): void {
  store.setItem(STORAGE_KEYS.MENU, items);
}

export function getStoredOrders(): Order[] {
  return store.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
}

export function saveStoredOrders(orders: Order[]): void {
  store.setItem(STORAGE_KEYS.ORDERS, orders);
}

export function getNextDailyOrderCount(): number {
  const current = store.getItem<number>(STORAGE_KEYS.ORDER_COUNTER, 1);
  store.setItem(STORAGE_KEYS.ORDER_COUNTER, current + 1);
  return current;
}

export function getStoredReservations(): TableReservation[] {
  return store.getItem<TableReservation[]>(STORAGE_KEYS.RESERVATIONS, []);
}

export function saveStoredReservations(reservations: TableReservation[]): void {
  store.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
}

export function getStoredReviews(): CustomerReview[] {
  return store.getItem<CustomerReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function saveStoredReviews(reviews: CustomerReview[]): void {
  store.setItem(STORAGE_KEYS.REVIEWS, reviews);
}

export function getStoredPromos(): PromoCode[] {
  return store.getItem<PromoCode[]>(STORAGE_KEYS.PROMOS, INITIAL_PROMOS);
}

export function saveStoredPromos(promos: PromoCode[]): void {
  store.setItem(STORAGE_KEYS.PROMOS, promos);
}

export function getStoredCart(): CartItem[] {
  return store.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
}

export function saveStoredCart(cart: CartItem[]): void {
  store.setItem(STORAGE_KEYS.CART, cart);
}

export function getCustomerLoyalty(phone: string): number {
  if (!phone) return 0;
  const accounts = store.getItem<Record<string, number>>(STORAGE_KEYS.LOYALTY, {
    '03001234567': 250, // Demo balance
  });
  return accounts[phone] || 0;
}

export function addCustomerLoyalty(phone: string, pointsEarned: number, pointsUsed: number = 0): number {
  if (!phone) return 0;
  const accounts = store.getItem<Record<string, number>>(STORAGE_KEYS.LOYALTY, {
    '03001234567': 250,
  });
  const current = accounts[phone] || 0;
  const updated = Math.max(0, current - pointsUsed + pointsEarned);
  accounts[phone] = updated;
  store.setItem(STORAGE_KEYS.LOYALTY, accounts);
  return updated;
}
