import React, { useState, useEffect, useCallback } from 'react';
import { CONFIG, INITIAL_COMBOS, INITIAL_PROMOS, INITIAL_REVIEWS } from './config';
import {
  MenuItem,
  CartItem,
  Order,
  TableReservation,
  CustomerReview,
  PromoCode,
  OrderStatus,
} from './types';
import {
  store,
  STORAGE_KEYS,
  getStoredMenu,
  saveStoredMenu,
  getStoredOrders,
  saveStoredOrders,
  getStoredReservations,
  saveStoredReservations,
  getStoredReviews,
  saveStoredReviews,
  getStoredPromos,
  saveStoredPromos,
  getStoredCart,
  saveStoredCart,
} from './store';
import { soundEffects } from './utils/audio';

import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CrownCrustSection } from './components/CrownCrustSection';
import { MenuSection } from './components/MenuSection';
import { DealsSection } from './components/DealsSection';
import { OurSpaceSection } from './components/OurSpaceSection';
import { StorySection } from './components/StorySection';
import { ReviewsSection } from './components/ReviewsSection';
import { ReservationSection } from './components/ReservationSection';
import { OrderTrackerSection } from './components/OrderTrackerSection';
import { FAQContactSection } from './components/FAQContactSection';
import { CartDrawer } from './components/CartDrawer';
import { VoiceConcierge } from './components/VoiceConcierge';
import { AdminPanel } from './components/AdminPanel';
import { CookingCraftSection } from './components/CookingCraftSection';
import { AIChefModal } from './components/AIChefModal';
import { QRCodeMenuModal } from './components/QRCodeMenuModal';
import { LoyaltyTrackerModal } from './components/LoyaltyTrackerModal';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';

import confetti from 'canvas-confetti';
import { AlertCircle } from 'lucide-react';

export default function App() {
  // App Theme & Sound Settings
  const [nightTheme, setNightTheme] = useState<boolean>(() => {
    return store.getItem<boolean>(STORAGE_KEYS.THEME_NIGHT, false);
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return soundEffects.isEnabled();
  });

  // Data State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getStoredMenu);
  const [combos] = useState<MenuItem[]>(INITIAL_COMBOS);
  const [promos, setPromos] = useState<PromoCode[]>(getStoredPromos);
  const [reviews, setReviews] = useState<CustomerReview[]>(getStoredReviews);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [reservations, setReservations] = useState<TableReservation[]>(getStoredReservations);
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [favorites, setFavorites] = useState<string[]>(() => {
    return store.getItem<string[]>(STORAGE_KEYS.FAVORITES, ['pizza-crown-signature']);
  });

  // UI Navigation & Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [isQRMenuOpen, setIsQRMenuOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('hero');

  // 3D Bunny Interaction Triggers
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [bunnyActionTrigger, setBunnyActionTrigger] = useState<string | null>(null);

  // Sync Night Theme class to body and documentElement (Tailwind dark mode support)
  useEffect(() => {
    if (nightTheme) {
      document.body.classList.add('night-theme');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('night-theme');
      document.documentElement.classList.remove('dark');
    }
    store.setItem(STORAGE_KEYS.THEME_NIGHT, nightTheme);
  }, [nightTheme]);

  // Listen to window hash for #admin route
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Sync storage changes across components and browser tabs
  useEffect(() => {
    const handleStorageEvent = (e: any) => {
      setOrders(getStoredOrders());
      setReservations(getStoredReservations());
      setMenuItems(getStoredMenu());
    };
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('bb:storage_change' as any, handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('bb:storage_change' as any, handleStorageEvent);
    };
  }, []);

  // Save Cart to Store whenever updated
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Easter Egg: typing 'carrot' triggers confetti storm
  useEffect(() => {
    let keyBuffer = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      keyBuffer += e.key.toLowerCase();
      if (keyBuffer.length > 8) keyBuffer = keyBuffer.slice(-8);
      if (keyBuffer.includes('carrot')) {
        soundEffects.playFanfare();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setBunnyActionTrigger('cart_add');
        keyBuffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    size?: { name: string; price: number },
    addOns: { name: string; price: number }[] = [],
    quantity: number = 1,
    instructions?: string
  ) => {
    const unitPrice =
      (size ? size.price : item.price) + addOns.reduce((sum, a) => sum + a.price, 0);

    const existingIndex = cart.findIndex(
      ci =>
        ci.menuItem.id === item.id &&
        ci.selectedSize?.name === size?.name &&
        JSON.stringify(ci.selectedAddOns) === JSON.stringify(addOns) &&
        ci.specialInstructions === instructions
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newCartItem: CartItem = {
        cartItemId: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItem: item,
        selectedSize: size,
        selectedAddOns: addOns,
        quantity,
        specialInstructions: instructions,
        unitPrice,
      };
      setCart([...cart, newCartItem]);
    }

    setBunnyActionTrigger('cart_add');
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    soundEffects.playPop();
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
    } else {
      setCart(cart.map(i => (i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i)));
    }
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    soundEffects.playPop();
    setCart(cart.filter(i => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleAddMultipleToCart = useCallback(
    (items: { item: MenuItem; size?: { name: string; price: number }; quantity: number }[]) => {
      items.forEach(({ item, size, quantity }) => {
        handleAddToCart(item, size, [], quantity);
      });
      setIsCartOpen(true);
    },
    [handleAddToCart]
  );

  const handleToggleFavorite = (itemId: string) => {
    let updated: string[];
    if (favorites.includes(itemId)) {
      updated = favorites.filter(id => id !== itemId);
    } else {
      updated = [...favorites, itemId];
    }
    setFavorites(updated);
    store.setItem(STORAGE_KEYS.FAVORITES, updated);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveStoredOrders(updated);
    setBunnyActionTrigger('order_placed');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveStoredOrders(updated);
  };

  const handleBookReservation = (newRes: TableReservation) => {
    const updated = [newRes, ...reservations];
    setReservations(updated);
    saveStoredReservations(updated);
  };

  const handleCancelReservation = (code: string, phone: string) => {
    const updated = reservations.map(r => {
      if (r.id === code && r.customerPhone === phone) {
        return { ...r, status: 'Cancelled' as const };
      }
      return r;
    });
    setReservations(updated);
    saveStoredReservations(updated);
    return true;
  };

  const handleAddReview = (newReview: CustomerReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveStoredReviews(updated);
  };

  const handleScrollTo = (sectionId: string) => {
    soundEffects.playPop();
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTrackOrderFromCart = (orderId: string) => {
    setTrackingOrderId(orderId);
    handleScrollTo('track-order');
  };

  const signaturePizza =
    menuItems.find(i => i.id === 'pizza-crown-signature') || menuItems[0];

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-[#8DBCE8] selection:text-[#2F5E9E] bg-[#FAF8F5] dark:bg-[#080D17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 0a. Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-hidden text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* 0b. Redesigned Boutique Announcement Bar (Mobile Optimized & Interactive) */}
      <AnnouncementBar onOrderClick={() => handleScrollTo('signature-crown')} />

      {/* 1. Procedural 3D WebGL Background Canvas with Rigged Bunny Mascot */}
      <ThreeCanvas
        isVoiceSpeaking={isVoiceSpeaking}
        bunnyActionTrigger={bunnyActionTrigger}
        onBunnyActionHandled={() => setBunnyActionTrigger(null)}
        activeSection={activeSection}
        themeNight={nightTheme}
      />

      {/* 2. Glass Sticky Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          soundEffects.setEnabled(next);
        }}
        nightTheme={nightTheme}
        onToggleNight={() => setNightTheme(!nightTheme)}
        onScrollTo={handleScrollTo}
        onOpenAIChef={() => setIsAIChefOpen(true)}
        onOpenQRMenu={() => setIsQRMenuOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        onBunnyEasterEgg={() => {
          soundEffects.playFanfare();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
          setBunnyActionTrigger('cloche_lift');
        }}
      />

      {/* Main Page Content (Overlaid on top of 3D Scene) */}
      <main id="main-content" className="relative z-10 flex-1">
        {/* 3. Hero Section */}
        <Hero
          onOrderClick={() => handleScrollTo('signature-crown')}
          onReserveClick={() => handleScrollTo('reservations')}
          onClocheLift={() => setBunnyActionTrigger('cloche_lift')}
          onOpenAIChef={() => setIsAIChefOpen(true)}
          onCraftClick={() => handleScrollTo('cooking-craft')}
          onOpenQRMenu={() => setIsQRMenuOpen(true)}
          onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        />

        {/* 4. Signature Crown Crust 3D Exploder Section */}
        <CrownCrustSection
          signatureItem={signaturePizza}
          onAddToCart={(item, size, addOns) => handleAddToCart(item, size, addOns, 1)}
        />

        {/* 4b. The Artisan Cooking Process: How Faisal Khan Bakes The Crown Crust */}
        <CookingCraftSection />

        {/* 5. Menu Ordering Engine */}
        <MenuSection
          menuItems={menuItems}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
        />

        {/* 6. Deals & Family Combos */}
        <DealsSection
          combos={combos}
          onAddComboToCart={combo => handleAddToCart(combo, undefined, [], 1)}
        />

        {/* 7. Interactive Santorini Space Room */}
        <OurSpaceSection />

        {/* 8. Peshawar Story & Values */}
        <StorySection />

        {/* 9. Guest Reviews & Submission */}
        <ReviewsSection reviews={reviews} onAddReview={handleAddReview} />

        {/* 10. Table Reservations Engine */}
        <ReservationSection
          reservations={reservations}
          onBookReservation={handleBookReservation}
          onCancelReservation={handleCancelReservation}
        />

        {/* 11. Live Order Tracker */}
        <OrderTrackerSection initialOrderId={trackingOrderId} orders={orders} />

        {/* 12. FAQ, Contact & Visit Us in Hayatabad */}
        <FAQContactSection />
      </main>

      {/* Semantic Boutique Footer */}
      <Footer
        onScrollTo={handleScrollTo}
        onOpenQRMenu={() => setIsQRMenuOpen(true)}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      {/* 13. Slide-out Glass Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        promos={promos}
        onOrderPlaced={handleOrderPlaced}
        onTrackOrder={handleTrackOrderFromCart}
      />

      {/* 14. Voice Concierge with Speech Recognition & Synthesis */}
      <VoiceConcierge
        menuItems={menuItems}
        onVoiceAddItem={(item, qty) => handleAddToCart(item, undefined, [], qty)}
        onVoiceOpenCart={() => setIsCartOpen(true)}
        onVoiceScrollTo={handleScrollTo}
        onSpeakingChange={setIsVoiceSpeaking}
      />

      {/* 15. Staff Operations & Kitchen Admin Portal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        reservations={reservations}
        onUpdateReservationStatus={(resId, st) => {
          const updated = reservations.map(r => (r.id === resId ? { ...r, status: st } : r));
          setReservations(updated);
          saveStoredReservations(updated);
        }}
        menuItems={menuItems}
        onUpdateMenuItems={items => {
          setMenuItems(items);
          saveStoredMenu(items);
        }}
        promos={promos}
        onUpdatePromos={p => {
          setPromos(p);
          saveStoredPromos(p);
        }}
        reviews={reviews}
        onUpdateReviews={r => {
          setReviews(r);
          saveStoredReviews(r);
        }}
      />

      {/* 16. AI Feast Sommelier & Chef Q&A Modal */}
      <AIChefModal
        isOpen={isAIChefOpen}
        onClose={() => setIsAIChefOpen(false)}
        menuItems={menuItems}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* 17. Dine-In Table QR Code Menu Modal */}
      <QRCodeMenuModal
        isOpen={isQRMenuOpen}
        onClose={() => setIsQRMenuOpen(false)}
        onSelectCategory={() => {
          setIsQRMenuOpen(false);
          handleScrollTo('menu');
        }}
      />

      {/* 18. Bunny Points Guest Loyalty Tracker Modal */}
      <LoyaltyTrackerModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
      />
    </div>
  );
}
