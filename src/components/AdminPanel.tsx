import React, { useState, useMemo } from 'react';
import {
  Order,
  TableReservation,
  MenuItem,
  PromoCode,
  CustomerReview,
  OrderStatus,
} from '../types';
import { CONFIG, INITIAL_MENU } from '../config';
import { store, STORAGE_KEYS } from '../store';
import { soundEffects } from '../utils/audio';
import {
  ShieldAlert,
  X,
  TrendingUp,
  PackageCheck,
  CalendarCheck,
  UtensilsCrossed,
  Tag,
  Settings,
  Database,
  Printer,
  Copy,
  CheckCircle,
  Phone,
  MessageCircle,
  AlertTriangle,
  Flame,
  Plus,
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  reservations: TableReservation[];
  onUpdateReservationStatus: (reservationId: string, status: any) => void;
  menuItems: MenuItem[];
  onUpdateMenuItems: (items: MenuItem[]) => void;
  promos: PromoCode[];
  onUpdatePromos: (promos: PromoCode[]) => void;
  reviews: CustomerReview[];
  onUpdateReviews: (reviews: CustomerReview[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  reservations,
  onUpdateReservationStatus,
  menuItems,
  onUpdateMenuItems,
  promos,
  onUpdatePromos,
  reviews,
  onUpdateReviews,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'reservations' | 'menu' | 'promos' | 'reviews' | 'settings' | 'data'
  >('orders');

  // Selected Order for Kitchen Ticket / Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ticketCopied, setTicketCopied] = useState(false);

  // Data Export/Import Textarea
  const [jsonBackupText, setJsonBackupText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Settings State
  const [busyMinutes, setBusyMinutes] = useState(CONFIG.busyExtraMinutes);
  const [acceptingOrders, setAcceptingOrders] = useState(CONFIG.acceptingOrders);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === CONFIG.adminPin) {
      soundEffects.playCartDing();
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      soundEffects.playPop();
      setPinError(true);
    }
  };

  // Overview metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const avgOrderValue = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    return validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  }, [orders, totalRevenue]);

  const handleCopyKitchenTicket = (order: Order) => {
    let ticket = `==============================\n`;
    ticket += `BUNNY BITES - KITCHEN TICKET\n`;
    ticket += `Order ID: ${order.id}\n`;
    ticket += `Time: ${new Date(order.createdAt).toLocaleTimeString()}\n`;
    ticket += `Type: ${order.type.toUpperCase()}\n`;
    if (order.tableNumber) ticket += `Table: ${order.tableNumber}\n`;
    ticket += `Customer: ${order.customerName} (${order.customerPhone})\n`;
    if (order.deliveryAddress) ticket += `Address: ${order.deliveryAddress}\n`;
    ticket += `------------------------------\n`;
    order.items.forEach((item, i) => {
      const size = item.selectedSize ? ` [${item.selectedSize.name}]` : '';
      ticket += `${i + 1}. (${item.quantity}x) ${item.menuItem.name}${size}\n`;
      if (item.selectedAddOns?.length) {
        ticket += `   Add-ons: ${item.selectedAddOns.map(a => a.name).join(', ')}\n`;
      }
      if (item.specialInstructions) {
        ticket += `   Note: *** ${item.specialInstructions} ***\n`;
      }
    });
    ticket += `------------------------------\n`;
    ticket += `TOTAL COD: Rs. ${order.total.toLocaleString()}\n`;
    ticket += `==============================\n`;

    navigator.clipboard.writeText(ticket).then(() => {
      setTicketCopied(true);
      setTimeout(() => setTicketCopied(false), 2000);
    });
  };

  // Toggle Menu Item Sold Out
  const toggleItemSoldOut = (itemId: string) => {
    soundEffects.playPop();
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isSoldOut: !item.isSoldOut };
      }
      return item;
    });
    onUpdateMenuItems(updated);
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const backup = {
      orders,
      reservations,
      menuItems,
      promos,
      reviews,
      exportedAt: new Date().toISOString(),
    };
    setJsonBackupText(JSON.stringify(backup, null, 2));
  };

  // Import JSON Backup
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonBackupText);
      if (parsed.orders) store.setItem(STORAGE_KEYS.ORDERS, parsed.orders);
      if (parsed.menuItems) onUpdateMenuItems(parsed.menuItems);
      if (parsed.reservations) store.setItem(STORAGE_KEYS.RESERVATIONS, parsed.reservations);
      setImportNotice('✓ Backup successfully restored!');
    } catch {
      setImportNotice('❌ Invalid JSON data format. Please verify the copied backup.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1A2536] w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl border-2 border-[#8DBCE8] flex flex-col overflow-hidden text-[#1F2430] dark:text-white">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#2F5E9E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-[#F5C45E]" />
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Bunny Bites Restaurant Operations Portal
              </h3>
              <p className="text-[11px] text-sky-200">
                Staff & Kitchen Management • Hayatabad, Peshawar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="px-6 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Demo Architecture Notice:</strong> Without an external database server, orders live in this browser instance. Customers send instant order dispatches via the WhatsApp button so orders reach your phone directly.
          </span>
        </div>

        {!isAuthenticated ? (
          /* PIN Entry Gate */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-slate-800 text-[#0189FE] flex items-center justify-center mb-4 text-3xl">
              🔐
            </div>
            <h4 className="text-xl font-black text-[#2F5E9E] dark:text-[#8DBCE8]">
              Staff PIN Required
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
              Enter your staff PIN to access kitchen orders, reservations, and menu configuration. (Default PIN is <strong>1234</strong>)
            </p>

            <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-3 w-64">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter PIN (1234)"
                className="w-full text-center px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xl font-mono tracking-widest focus:border-[#0189FE]"
                autoFocus
              />
              {pinError && (
                <span className="text-xs font-bold text-rose-500">Incorrect PIN. Try 1234</span>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-xs bg-[#0189FE] hover:bg-[#2F5E9E] text-white shadow-md transition-colors cursor-pointer"
              >
                Access Portal
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56 bg-gray-50 dark:bg-slate-800/60 border-r border-[#8DBCE8]/30 p-3 flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4" />
                  <span>Live Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reservations')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'reservations'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Reservations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('menu')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'menu'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Menu Manager</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('promos')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'promos'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Promo Codes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('data');
                  handleExportJson();
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-[#0189FE] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-slate-700'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Backup & Data</span>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-[#1A2536]">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                    Today's Performance Overview
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200">
                      <span className="text-xs text-gray-500 font-bold block">Total Orders</span>
                      <span className="text-3xl font-black text-[#0189FE]">
                        {orders.length}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200">
                      <span className="text-xs text-gray-500 font-bold block">Total Revenue</span>
                      <span className="text-3xl font-black text-emerald-600">
                        Rs. {totalRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200">
                      <span className="text-xs text-gray-500 font-bold block">Average Order Value</span>
                      <span className="text-3xl font-black text-amber-600">
                        Rs. {avgOrderValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Orders by Status Breakdown */}
                  <div className="p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
                    <h5 className="font-bold text-sm text-[#2F5E9E] dark:text-sky-300 mb-3">
                      Orders Breakdown
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {(['New', 'Preparing', 'Out for delivery', 'Completed', 'Cancelled'] as OrderStatus[]).map(st => {
                        const count = orders.filter(o => o.status === st).length;
                        return (
                          <div key={st} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs border text-xs">
                            <span className="text-gray-500 block">{st}</span>
                            <span className="text-lg font-black text-[#2F5E9E] dark:text-white">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE ORDERS & KITCHEN TICKETS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                      Live Kitchen & Delivery Orders ({orders.length})
                    </h4>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300">
                      <span className="text-4xl">🍕🐰</span>
                      <p className="font-bold text-sm text-gray-500 mt-2">
                        No orders recorded on this device yet.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Place a test order from the website or WhatsApp!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div
                          key={order.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-[#0189FE] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-base text-[#0189FE]">
                                {order.id}
                              </span>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-[#2F5E9E] uppercase">
                                {order.type}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                              {order.customerName} ({order.customerPhone})
                            </p>

                            {order.deliveryAddress && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                🏠 {order.deliveryAddress}
                              </p>
                            )}

                            <div className="text-xs text-[#2F5E9E] dark:text-sky-300 font-semibold mt-1">
                              {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(' • ')}
                            </div>
                          </div>

                          {/* Status Progression Controls */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-[#0189FE] mr-2">
                              Rs. {order.total.toLocaleString()}
                            </span>

                            <select
                              value={order.status}
                              onChange={e => {
                                soundEffects.playOrderChime();
                                onUpdateOrderStatus(order.id, e.target.value as OrderStatus);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-black text-[#2F5E9E] dark:text-white cursor-pointer"
                            >
                              <option value="New">Status: New</option>
                              <option value="Preparing">Status: Preparing</option>
                              <option value="Out for delivery">Status: Out for Delivery</option>
                              <option value="Ready for pickup">Status: Ready for Pickup</option>
                              <option value="Completed">Status: Completed</option>
                              <option value="Cancelled">Status: Cancelled</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleCopyKitchenTicket(order)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 flex items-center gap-1 cursor-pointer"
                              title="Copy kitchen ticket text"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{ticketCopied ? 'Copied!' : 'Kitchen Ticket'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESERVATIONS */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                    Table Bookings ({reservations.length})
                  </h4>

                  {reservations.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300">
                      <p className="font-bold text-sm text-gray-500">No reservations booked yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map(res => (
                        <div
                          key={res.id}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-[#0189FE]">{res.id}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                {res.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-800 dark:text-white mt-1">
                              {res.customerName} ({res.customerPhone}) • {res.partySize} Guests
                            </p>
                            <p className="text-xs text-gray-500">
                              Date: {res.date} at {res.time} ({res.occasion})
                            </p>
                            {res.specialRequests && (
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Note: {res.specialRequests}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {res.status !== 'Cancelled' && (
                              <button
                                type="button"
                                onClick={() => onUpdateReservationStatus(res.id, 'Cancelled')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onUpdateReservationStatus(res.id, 'Seated')}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Mark Seated
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MENU MANAGER */}
              {activeTab === 'menu' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                      Dishes & Menu Manager ({menuItems.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {menuItems.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">
                            {item.category}
                          </span>
                          <h5 className="font-bold text-sm text-[#2F5E9E] dark:text-white">
                            {item.name}
                          </h5>
                          <span className="text-xs font-black text-[#0189FE]">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleItemSoldOut(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                            item.isSoldOut
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {item.isSoldOut ? 'Sold Out 🚫' : 'In Stock ✓'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PROMO CODES */}
              {activeTab === 'promos' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                    Active Promo Codes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {promos.map(promo => (
                      <div
                        key={promo.code}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-sky-300 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-black text-base text-[#0189FE] block">
                            {promo.code}
                          </span>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {promo.description}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Min Order: Rs. {promo.minOrder.toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 max-w-xl">
                  <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                    Kitchen & Delivery Settings
                  </h4>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="block text-sm">Accepting Orders</strong>
                        <span className="text-gray-500">Allow customers to submit orders</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={acceptingOrders}
                        onChange={e => setAcceptingOrders(e.target.checked)}
                        className="w-5 h-5 accent-[#0189FE] cursor-pointer"
                      />
                    </div>

                    <div>
                      <strong className="block text-sm mb-1">Kitchen Busy Mode (Extra Minutes)</strong>
                      <span className="text-gray-500 block mb-2">
                        Add extra preparation time to customer delivery estimates during peak rush.
                      </span>
                      <div className="flex items-center gap-2">
                        {[0, 15, 30, 45].map(min => (
                          <button
                            key={min}
                            type="button"
                            onClick={() => {
                              soundEffects.playPop();
                              setBusyMinutes(min);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold ${
                              busyMinutes === min
                                ? 'bg-[#0189FE] text-white'
                                : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border'
                            }`}
                          >
                            +{min} mins
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: DATA & BACKUP */}
              {activeTab === 'data' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-lg text-[#2F5E9E] dark:text-[#8DBCE8]">
                    Backup & Data Portability
                  </h4>
                  <p className="text-xs text-gray-500">
                    Export your menu, orders, and reservations to JSON. You can copy the text or restore backups anytime.
                  </p>

                  {importNotice && (
                    <div className="p-3 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold">
                      {importNotice}
                    </div>
                  )}

                  <textarea
                    rows={8}
                    value={jsonBackupText}
                    onChange={e => setJsonBackupText(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-300 dark:border-slate-700 font-mono text-xs bg-gray-50 dark:bg-slate-900"
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleExportJson}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0189FE] text-white"
                    >
                      Refresh Export
                    </button>
                    <button
                      type="button"
                      onClick={handleImportJson}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                    >
                      Import & Restore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
