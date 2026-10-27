import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePakistaniPhone,
  generateOrderId,
  calculateOrderPricing,
  calculateLoyaltyPointsEarned,
  isRestaurantOpen,
  formatWhatsAppOrderMessage,
  RESTAURANT_TABLES,
  getTableOccupancy,
} from './rules';
import { CartItem, MenuItem } from '../types';

test('Pakistani phone validation accepts 03xx-xxxxxxx and +92 formats', () => {
  const v1 = validatePakistaniPhone('03001234567');
  assert.equal(v1.isValid, true);
  assert.equal(v1.normalized, '03001234567');

  const v2 = validatePakistaniPhone('0300-1234567');
  assert.equal(v2.isValid, true);
  assert.equal(v2.normalized, '03001234567');

  const v3 = validatePakistaniPhone('+92 300 1234567');
  assert.equal(v3.isValid, true);
  assert.equal(v3.normalized, '03001234567');

  const v4 = validatePakistaniPhone('923451234567');
  assert.equal(v4.isValid, true);
  assert.equal(v4.normalized, '03451234567');

  // Invalid numbers
  const inv1 = validatePakistaniPhone('12345');
  assert.equal(inv1.isValid, false);

  const inv2 = validatePakistaniPhone('0423123456');
  assert.equal(inv2.isValid, false);
});

test('Order ID generator creates BB-YYMMDD-001 format', () => {
  const testDate = new Date('2026-10-26T12:00:00Z');
  const id1 = generateOrderId(1, testDate);
  assert.equal(id1, 'BB-261026-001');

  const id42 = generateOrderId(42, testDate);
  assert.equal(id42, 'BB-261026-042');
});

test('Order pricing computes subtotal, free delivery threshold, promos and small order fee', () => {
  const dummyItem: MenuItem = {
    id: 'pizza-test',
    name: 'Crown Pizza',
    category: 'Pizza',
    description: 'Test',
    price: 1000,
    imageSvgType: 'crown-pizza',
  };

  const cart: CartItem[] = [
    {
      cartItemId: '1',
      menuItem: dummyItem,
      selectedAddOns: [],
      quantity: 1,
      unitPrice: 1000,
    },
  ];

  const config = {
    deliveryFeeBase: 150,
    freeDeliveryOver: 1500,
    smallOrderFeeThreshold: 249,
    smallOrderFee: 50,
    taxPercent: 0,
  };

  // Subtotal 1000 < 1500 -> Delivery fee 150 applies
  const p1 = calculateOrderPricing(cart, 'delivery', null, 0, config);
  assert.equal(p1.subtotal, 1000);
  assert.equal(p1.deliveryFee, 150);
  assert.equal(p1.smallOrderFee, 0);
  assert.equal(p1.total, 1150);
  assert.equal(p1.freeDeliveryThresholdDiff, 500);

  // Subtotal 2000 >= 1500 -> Free delivery
  const cart2: CartItem[] = [{ ...cart[0], quantity: 2 }];
  const p2 = calculateOrderPricing(cart2, 'delivery', null, 0, config);
  assert.equal(p2.subtotal, 2000);
  assert.equal(p2.deliveryFee, 0);
  assert.equal(p2.total, 2000);
  assert.equal(p2.freeDeliveryThresholdDiff, 0);

  // Small order fee applies below 249
  const cheapItem: MenuItem = { ...dummyItem, price: 150 };
  const cartSmall: CartItem[] = [{ cartItemId: '3', menuItem: cheapItem, selectedAddOns: [], quantity: 1, unitPrice: 150 }];
  const pSmall = calculateOrderPricing(cartSmall, 'delivery', null, 0, config);
  assert.equal(pSmall.subtotal, 150);
  assert.equal(pSmall.smallOrderFee, 50);
  assert.equal(pSmall.deliveryFee, 150);
  assert.equal(pSmall.total, 350);

  // Pickup has 0 delivery fee and 0 small order fee
  const pPickup = calculateOrderPricing(cartSmall, 'pickup', null, 0, config);
  assert.equal(pPickup.deliveryFee, 0);
  assert.equal(pPickup.smallOrderFee, 0);
  assert.equal(pPickup.total, 150);

  // Promo code 10%
  const promo = {
    code: 'BUNNY10',
    type: 'percent' as const,
    value: 10,
    minOrder: 500,
    isActive: true,
    description: '10% off',
  };
  const pPromo = calculateOrderPricing(cart, 'delivery', promo, 0, config);
  assert.equal(pPromo.discount, 100);
  assert.equal(pPromo.total, 1050); // 1000 - 100 + 150
});

test('calculateLoyaltyPointsEarned gives 1 point per Rs. 100', () => {
  assert.equal(calculateLoyaltyPointsEarned(950), 9);
  assert.equal(calculateLoyaltyPointsEarned(1500), 15);
  assert.equal(calculateLoyaltyPointsEarned(50), 0);
});

test('isRestaurantOpen recognizes 12 PM - 3 AM window', () => {
  const afternoon = new Date('2026-10-26T14:00:00'); // 2 PM
  assert.equal(isRestaurantOpen(afternoon).isOpen, true);

  const midnight = new Date('2026-10-26T01:30:00'); // 1:30 AM
  assert.equal(isRestaurantOpen(midnight).isOpen, true);

  const morning = new Date('2026-10-26T08:00:00'); // 8 AM
  assert.equal(isRestaurantOpen(morning).isOpen, false);
});

test('WhatsApp order message includes order ID, items and total', () => {
  const dummyItem: MenuItem = {
    id: 'pizza-test',
    name: 'Bunny Crown Crust',
    category: 'Pizza',
    description: 'Test',
    price: 1450,
    imageSvgType: 'crown-pizza',
  };
  const cart: CartItem[] = [
    {
      cartItemId: '1',
      menuItem: dummyItem,
      selectedSize: { name: 'Medium (11")', price: 1450 },
      selectedAddOns: [{ name: 'Extra Cheese', price: 200 }],
      quantity: 1,
      unitPrice: 1650,
    },
  ];
  const msg = formatWhatsAppOrderMessage(
    'BB-261026-001',
    cart,
    'delivery',
    {
      subtotal: 1650,
      deliveryFee: 0,
      smallOrderFee: 0,
      discount: 0,
      loyaltyDiscount: 0,
      tax: 0,
      total: 1650,
      freeDeliveryThresholdDiff: 0,
    },
    {
      name: 'Ahmed Khan',
      phone: '0300 1234567',
      address: 'House 42, Street 7, Phase 1 Hayatabad',
    }
  );

  assert.ok(msg.includes('BB-261026-001'));
  assert.ok(msg.includes('Bunny Crown Crust'));
  assert.ok(msg.includes('Ahmed Khan'));
  assert.ok(msg.includes('Rs. 1,650'));
});

test('getTableOccupancy correctly marks booked tables as occupied', () => {
  const testReservations = [
    {
      id: 'BB-R-TEST',
      date: '2026-10-27',
      time: '19:00',
      partySize: 4,
      status: 'Confirmed',
      customerName: 'Afridi',
      tableNumber: 'T1',
    },
  ];

  const occSlot1 = getTableOccupancy(RESTAURANT_TABLES, testReservations, '2026-10-27', '19:00');
  assert.equal(occSlot1['T1'].isOccupied, true);
  assert.equal(occSlot1['T1'].reservedBy, 'Afridi');
  assert.equal(occSlot1['T2'].isOccupied, false);

  // Different slot should be free
  const occSlot2 = getTableOccupancy(RESTAURANT_TABLES, testReservations, '2026-10-27', '20:00');
  assert.equal(occSlot2['T1'].isOccupied, false);
});
