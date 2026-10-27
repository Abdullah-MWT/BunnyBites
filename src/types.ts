export type OrderType = 'delivery' | 'pickup' | 'dinein';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageSvgType: 'crown-pizza' | 'burger' | 'chicken' | 'wings' | 'noodlepasta' | 'baked' | 'drink' | 'combo';
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  isSoldOut?: boolean;
  sizes?: { name: string; price: number }[];
  addOns?: { name: string; price: number }[];
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  selectedSize?: { name: string; price: number };
  selectedAddOns: { name: string; price: number }[];
  quantity: number;
  specialInstructions?: string;
  unitPrice: number;
}

export type OrderStatus = 'New' | 'Preparing' | 'Out for delivery' | 'Ready for pickup' | 'Completed' | 'Cancelled';

export interface Order {
  id: string; // BB-YYMMDD-001
  createdAt: string;
  status: OrderStatus;
  type: OrderType;
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryLandmark?: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  smallOrderFee: number;
  discount: number;
  promoCode?: string;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  total: number;
  estimatedMinutes: number;
}

export interface TableReservation {
  id: string; // BB-R-XXXX
  createdAt: string;
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  tableNumber?: string;
  tableName?: string;
  occasion?: string;
  specialRequests?: string;
  status: 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled';
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  isSample?: boolean;
  approved: boolean;
}

export interface PromoCode {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  isActive: boolean;
  description: string;
}

export interface AppConfig {
  name: string;
  tagline: string;
  city: string;
  area: string;
  fullAddress: string;
  phone: string;
  whatsapp: string; // 923001234567
  openingHoursDisplay: string;
  openHour: number; // e.g. 12 (12 PM)
  closeHour: number; // e.g. 3 (3 AM next day)
  deliveryFeeBase: number;
  freeDeliveryOver: number;
  minOrder: number;
  smallOrderFeeThreshold: number;
  smallOrderFee: number;
  taxPercent: number;
  totalTables: number;
  totalSeats: number;
  stayMinutes: number;
  adminPin: string;
  demoMode: boolean;
  social: {
    tiktok: string;
    facebook: string;
    instagram: string;
  };
  ownerStory: string;
  currency: string;
  acceptingOrders: boolean;
  busyExtraMinutes: number;
}
