import React, { useState, useMemo, useRef } from 'react';
import { MenuItem } from '../types';
import { FoodIllustration } from './FoodIllustrations';
import {
  Search,
  Heart,
  Plus,
  Check,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface MenuSectionProps {
  menuItems: MenuItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (
    item: MenuItem,
    size?: { name: string; price: number },
    addOns?: { name: string; price: number }[],
    quantity?: number,
    instructions?: string
  ) => void;
  onHoverItem?: (x: number, y: number) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onHoverItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [filterSpicyOnly, setFilterSpicyOnly] = useState<boolean>(false);
  const [filterUnder1000, setFilterUnder1000] = useState<boolean>(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc'>('popular');

  // Modal State for customizer
  const [activeModalItem, setActiveModalItem] = useState<MenuItem | null>(null);
  const [modalSizeIndex, setModalSizeIndex] = useState<number>(0);
  const [modalAddOns, setModalAddOns] = useState<{ name: string; price: number }[]>([]);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalInstructions, setModalInstructions] = useState<string>('');

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(i => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems
      .filter(item => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (filterVegOnly && !item.isVegetarian) return false;
        if (filterSpicyOnly && !item.isSpicy) return false;
        if (filterUnder1000 && item.price >= 1000) return false;
        if (filterBestsellerOnly && !item.isBestseller) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
        return 0;
      });
  }, [
    menuItems,
    selectedCategory,
    searchQuery,
    filterVegOnly,
    filterSpicyOnly,
    filterUnder1000,
    filterBestsellerOnly,
    sortBy,
  ]);

  const scrollCategories = (direction: 'left' | 'right') => {
    soundEffects.playPop();
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const openCustomizeModal = (item: MenuItem) => {
    soundEffects.playPop();
    setActiveModalItem(item);
    setModalSizeIndex(0);
    setModalAddOns([]);
    setModalQuantity(1);
    setModalInstructions('');
  };

  const handleModalAdd = () => {
    if (!activeModalItem) return;
    soundEffects.playCartDing();

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#0189FE', '#D97706'],
      });
    } catch {}

    const chosenSize = activeModalItem.sizes ? activeModalItem.sizes[modalSizeIndex] : undefined;
    onAddToCart(activeModalItem, chosenSize, modalAddOns, modalQuantity, modalInstructions);
    setActiveModalItem(null);
  };

  const toggleModalAddOn = (addOn: { name: string; price: number }) => {
    soundEffects.playPop();
    if (modalAddOns.some(a => a.name === addOn.name)) {
      setModalAddOns(modalAddOns.filter(a => a.name !== addOn.name));
    } else {
      setModalAddOns([...modalAddOns, addOn]);
    }
  };

  return (
    <section id="menu" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      {/* Editorial Section Header */}
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Curated Offerings
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          The Dining Menu
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Crafted fresh to order in our stone ovens. Prepared with pure mozzarella, 24-hour fermented dough, and cold-pressed olive oil in Hayatabad.
        </p>
      </div>

      {/* Single Straight Line Category Tabs (Segmented Control Style) */}
      <div className="sticky top-16 z-30 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 backdrop-blur-md bg-[#FAF8F5]/90 dark:bg-[#0C121D]/90 border-y border-stone-200/80 dark:border-slate-800/80 transition-colors">
        <div className="relative flex items-center max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => scrollCategories('left')}
            aria-label="Previous categories"
            className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white items-center justify-center mr-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={categoryScrollRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1 scroll-smooth"
          >
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setSelectedCategory(cat);
                  }}
                  className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories('right')}
            aria-label="Next categories"
            className="hidden sm:flex shrink-0 w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white items-center justify-center ml-1 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Refined Filter & Search Bar */}
      <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pizza, chicken, wings, pasta..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#131B2A] border border-stone-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-slate-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quiet Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilterBestsellerOnly(!filterBestsellerOnly)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterBestsellerOnly
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950'
                : 'bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            Bestsellers
          </button>

          <button
            type="button"
            onClick={() => setFilterSpicyOnly(!filterSpicyOnly)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterSpicyOnly
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950'
                : 'bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            Spicy
          </button>

          <button
            type="button"
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterVegOnly
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950'
                : 'bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            Vegetarian
          </button>

          <button
            type="button"
            onClick={() => setFilterUnder1000(!filterUnder1000)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterUnder1000
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950'
                : 'bg-white dark:bg-[#131B2A] text-slate-600 dark:text-slate-400 border-stone-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            Under Rs. 1,000
          </button>

          {/* Sorter */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#131B2A] border border-stone-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
          >
            <option value="popular">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Boutique Menu Grid (Generous Whitespace, Minimalist Icon Badges) */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const isFav = favorites.includes(item.id);
          const isSoldOut = item.isSoldOut;

          return (
            <div
              key={item.id}
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (onHoverItem) onHoverItem(rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
              className={`boutique-card p-6 flex flex-col justify-between group relative ${
                isSoldOut ? 'opacity-50 grayscale' : ''
              }`}
            >
              {/* Top Row: Category Kicker & Favorite */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean">
                  {item.category}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    onToggleFavorite(item.id);
                  }}
                  aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                  className={`p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer ${
                    isFav ? 'text-rose-500' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Minimalist Culinary Icon Slot (Spacious, Uncluttered) */}
              <div className="py-2 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-stone-50 dark:bg-slate-800/40 border border-stone-200/60 dark:border-slate-800 flex items-center justify-center p-3 text-slate-800 dark:text-slate-200 group-hover:scale-105 transition-transform">
                  <FoodIllustration type={item.imageSvgType} className="w-14 h-14" />
                </div>
              </div>

              {/* Dish Name & Description */}
              <div className="mt-4 flex-1">
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Clean Unboxed Metadata (Zero-Pill Rule) */}
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-slate-500">
                  {item.isBestseller && <span>Bestseller</span>}
                  {item.isBestseller && (item.isSpicy || item.isVegetarian) && <span aria-hidden="true">·</span>}
                  {item.isSpicy && <span>Medium Spice</span>}
                  {item.isSpicy && item.isVegetarian && <span aria-hidden="true">·</span>}
                  {item.isVegetarian && <span>Vegetarian</span>}
                </div>
              </div>

              {/* Price & Add Action */}
              <div className="mt-5 pt-3.5 border-t border-stone-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-slate-500 block">
                    {item.sizes ? 'From' : 'Price'}
                  </span>
                  <span className="font-mono tabular-nums text-base font-bold text-slate-900 dark:text-white">
                    Rs. {item.price.toLocaleString()}
                  </span>
                </div>

                {isSoldOut ? (
                  <span className="text-xs text-stone-400">Sold out</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCustomizeModal(item)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 dark:text-white hover:bg-stone-100 dark:hover:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0189FE]" />
                    <span>{item.sizes ? 'Select' : 'Add'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16 boutique-card mt-8 p-8 max-w-md mx-auto">
          <Filter className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">No dishes match</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters to explore our full stone-oven selection.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setFilterBestsellerOnly(false);
              setFilterSpicyOnly(false);
              setFilterVegOnly(false);
              setFilterUnder1000(false);
            }}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-950 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Customize & Quantity Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#131B2A] rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-wider">
                  {activeModalItem.category}
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeModalItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sizes Selection (if available) */}
            {activeModalItem.sizes && (
              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Select Portion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeModalItem.sizes.map((s, idx) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        soundEffects.playPop();
                        setModalSizeIndex(idx);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        modalSizeIndex === idx
                          ? 'border-slate-900 dark:border-white bg-stone-50 dark:bg-slate-800'
                          : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                        Rs. {s.price.toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons (if available) */}
            {activeModalItem.addOns && activeModalItem.addOns.length > 0 && (
              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Chef Upgrades
                </label>
                <div className="space-y-1.5">
                  {activeModalItem.addOns.map(addon => {
                    const isChecked = modalAddOns.some(a => a.name === addon.name);
                    return (
                      <button
                        key={addon.name}
                        type="button"
                        onClick={() => toggleModalAddOn(addon)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'border-slate-900 dark:border-white bg-stone-50 dark:bg-slate-800'
                            : 'border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-900 dark:text-white">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white text-white dark:text-slate-900' : 'border-stone-300 dark:border-slate-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span>{addon.name}</span>
                        </div>
                        <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                          +Rs. {addon.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5 flex items-center justify-between border-t border-stone-100 dark:border-slate-800 pt-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setModalQuantity(Math.max(1, modalQuantity - 1));
                  }}
                  className="w-7 h-7 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playPop();
                    setModalQuantity(modalQuantity + 1);
                  }}
                  className="w-7 h-7 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mt-3">
              <input
                type="text"
                value={modalInstructions}
                onChange={e => setModalInstructions(e.target.value)}
                placeholder="Kitchen notes (e.g. extra crispy, sauce on side)..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-slate-500"
              />
            </div>

            {/* Submit */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-wider block">
                  Subtotal
                </span>
                <span className="font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-white">
                  Rs.{' '}
                  {(
                    ((activeModalItem.sizes ? activeModalItem.sizes[modalSizeIndex].price : activeModalItem.price) +
                      modalAddOns.reduce((s, a) => s + a.price, 0)) *
                    modalQuantity
                  ).toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleModalAdd}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-stone-100 font-semibold text-xs tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
