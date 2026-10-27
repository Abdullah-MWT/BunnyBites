import React, { useState, useMemo } from 'react';
import { TableReservation } from '../types';
import { CONFIG } from '../config';
import {
  validatePakistaniPhone,
  generateReservationCode,
  RESTAURANT_TABLES,
  getTableOccupancy,
  FloorTable,
} from '../utils/rules';
import { soundEffects } from '../utils/audio';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Armchair,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReservationSectionProps {
  reservations: TableReservation[];
  onBookReservation: (reservation: TableReservation) => void;
  onCancelReservation: (code: string, phone: string) => boolean;
}

export const ReservationSection: React.FC<ReservationSectionProps> = ({
  reservations,
  onBookReservation,
  onCancelReservation,
}) => {
  // Tab: 'book' | 'manage'
  const [tab, setTab] = useState<'book' | 'manage'>('book');

  // Booking Form State
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>('19:00');
  const [partySize, setPartySize] = useState<number>(4);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('Family Dinner');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<TableReservation | null>(null);
  const [hoveredTable, setHoveredTable] = useState<FloorTable | null>(null);

  // Manage Form State
  const [manageCode, setManageCode] = useState<string>('');
  const [managePhone, setManagePhone] = useState<string>('');
  const [manageResult, setManageResult] = useState<{ found?: TableReservation; message?: string } | null>(null);

  // Generate 30-min time slots from 12:00 to 02:30 (next day)
  const availableSlots = useMemo(() => {
    const slots: string[] = [];
    // 12:00 PM to 11:30 PM
    for (let h = 12; h <= 23; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    // 00:00 to 02:30 (late night)
    for (let h = 0; h <= 2; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Compute table occupancy for the selected date & time
  const tableOccupancy = useMemo(() => {
    return getTableOccupancy(RESTAURANT_TABLES, reservations, date, time);
  }, [reservations, date, time]);

  // Check capacity for selected date & time
  const currentSlotBookedSeats = useMemo(() => {
    return reservations
      .filter(r => r.date === date && r.time === time && r.status !== 'Cancelled')
      .reduce((sum, r) => sum + r.partySize, 0);
  }, [reservations, date, time]);

  const seatsRemaining = Math.max(0, CONFIG.totalSeats - currentSlotBookedSeats);
  const isSlotFull = seatsRemaining < partySize;

  // Auto-pick or validate selected table
  const selectedTable = useMemo(() => {
    if (selectedTableId) {
      const match = RESTAURANT_TABLES.find(t => t.id === selectedTableId);
      if (match && !tableOccupancy[match.id]?.isOccupied && match.seats >= partySize) {
        return match;
      }
    }
    // Fallback: first available table that fits party size
    return RESTAURANT_TABLES.find(t => !tableOccupancy[t.id]?.isOccupied && t.seats >= partySize) || null;
  }, [selectedTableId, tableOccupancy, partySize]);

  const handleTableClick = (table: FloorTable) => {
    soundEffects.playPop();
    if (tableOccupancy[table.id]?.isOccupied) return;
    if (table.seats < partySize) {
      setErrorMsg(`Table ${table.id} (${table.name}) seats up to ${table.seats} guests. Please select a larger table or booth.`);
      return;
    }
    setErrorMsg(null);
    setSelectedTableId(table.id);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate phone
    const phoneVal = validatePakistaniPhone(phone);
    if (!phoneVal.isValid) {
      setErrorMsg(phoneVal.error || 'Invalid Pakistani mobile number');
      return;
    }

    // Minimum 60 min notice for same day
    const now = new Date();
    if (date === todayStr) {
      const [h, m] = time.split(':').map(Number);
      const slotTime = new Date(now);
      slotTime.setHours(h, m, 0, 0);
      // Handle late night past midnight slots
      if (h < 4) {
        slotTime.setDate(slotTime.getDate() + 1);
      }
      const diffMinutes = (slotTime.getTime() - now.getTime()) / (1000 * 60);
      if (diffMinutes < 0) {
        setErrorMsg('This time slot has already passed for today. Please select an upcoming time slot or future date.');
        return;
      }
      if (diffMinutes < 45 && h >= 4) {
        setErrorMsg('Same-day reservations require advance notice. Please pick a later slot today.');
        return;
      }
    }

    // Check capacity
    if (isSlotFull || !selectedTable) {
      setErrorMsg(`Sorry, no matching tables are available for a party of ${partySize} at this time. Please pick another time slot.`);
      return;
    }

    soundEffects.playCartDing();
    const newReservation: TableReservation = {
      id: generateReservationCode(),
      createdAt: new Date().toISOString(),
      customerName: name.trim(),
      customerPhone: phoneVal.normalized,
      date,
      time,
      partySize,
      tableNumber: selectedTable.id,
      tableName: `${selectedTable.name} (${selectedTable.zone})`,
      occasion,
      specialRequests: specialRequests.trim() || undefined,
      status: 'Confirmed',
    };

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0189FE', '#F5C45E', '#8DBCE8'],
      });
    } catch {}

    onBookReservation(newReservation);
    setConfirmedReservation(newReservation);
  };

  const handleLookupManage = (e: React.FormEvent) => {
    e.preventDefault();
    setManageResult(null);
    const cleanedCode = manageCode.trim().toUpperCase();
    const phoneVal = validatePakistaniPhone(managePhone);

    const match = reservations.find(
      r => r.id.toUpperCase() === cleanedCode && (r.customerPhone === phoneVal.normalized || r.customerPhone === managePhone.trim())
    );

    if (match) {
      setManageResult({ found: match });
    } else {
      setManageResult({ message: 'No active reservation found with this code and phone number.' });
    }
  };

  const handleCancel = (res: TableReservation) => {
    soundEffects.playPop();
    const success = onCancelReservation(res.id, res.customerPhone);
    if (success) {
      setManageResult({
        message: `Reservation ${res.id} has been successfully cancelled. We hope to host you next time!`,
      });
    }
  };

  // Group tables by zones for clear floor plan presentation
  const boothTables = RESTAURANT_TABLES.filter(t => t.zone === 'Cloud Booths');
  const archTables = RESTAURANT_TABLES.filter(t => t.zone === 'Santorini Arches');
  const gardenTables = RESTAURANT_TABLES.filter(t => t.zone === 'Bunny Center');

  return (
    <section id="reservations" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
      <div className="max-w-2xl mb-12">
        <div className="text-xs font-semibold tracking-wider text-stone-400 dark:text-slate-500 uppercase font-sans-clean mb-2">
          Table Bookings · Interactive Floor Plan · 14 Tables
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Reserve Your Table
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Guarantee your Santorini blue booth or arch table with real-time floor plan selection in Hayatabad.
        </p>

        {/* Tab Toggle */}
        <div className="inline-flex rounded-xl p-1 bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 mt-6">
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              setTab('book');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'book'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Book New Table
          </button>
          <button
            type="button"
            onClick={() => {
              soundEffects.playPop();
              setTab('manage');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'manage'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Manage Booking
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {tab === 'book' ? (
          <div className="boutique-card p-6 md:p-8">
            {confirmedReservation ? (
              <div className="text-center py-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-[#2F5E9E] dark:text-[#8DBCE8]">
                  Table Reserved Successfully!
                </h3>
                <p className="text-sm text-[#1F2430]/80 dark:text-gray-300 mt-2">
                  Your reservation code is:
                </p>
                <div className="text-3xl font-black tracking-widest text-[#0189FE] my-3 px-6 py-2 rounded-2xl bg-sky-50 dark:bg-slate-800 border-2 border-dashed border-[#0189FE]">
                  {confirmedReservation.id}
                </div>

                {confirmedReservation.tableName && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold mb-3 border border-amber-300">
                    <Armchair className="w-4 h-4 text-amber-600" />
                    <span>Assigned: Table {confirmedReservation.tableNumber} – {confirmedReservation.tableName}</span>
                  </div>
                )}

                <p className="text-xs text-gray-500 max-w-md">
                  We have reserved your table on <strong>{confirmedReservation.date}</strong> at <strong>{confirmedReservation.time}</strong> for <strong>{confirmedReservation.partySize} guests</strong>.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
                      `Hello Bunny Bites! I just booked a table: Code ${confirmedReservation.id} (Table #${confirmedReservation.tableNumber} - ${confirmedReservation.tableName}) for ${confirmedReservation.partySize} persons on ${confirmedReservation.date} at ${confirmedReservation.time}. Name: ${confirmedReservation.customerName}. Looking forward to the Crown Crust!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full text-xs font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send WhatsApp Confirmation</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedReservation(null);
                      setName('');
                      setPhone('');
                      setSelectedTableId(null);
                    }}
                    className="px-5 py-3 rounded-full text-xs font-bold bg-white dark:bg-slate-700 text-[#2F5E9E] dark:text-sky-300 border border-[#8DBCE8]"
                  >
                    Book Another Table
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook} className="flex flex-col gap-6">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Date, Time & Party Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      max={maxDateStr}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    />
                  </div>

                  {/* Time slot */}
                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    >
                      {availableSlots.map(s => (
                        <option key={s} value={s}>
                          {s} ({s.startsWith('0') && parseInt(s) < 4 ? 'Night' : 'PM/Eve'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Party Size (1–12)
                    </label>
                    <select
                      value={partySize}
                      onChange={e => setPartySize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* ARCHITECTURAL FLOOR PLAN & LIVE HOVER TOOLTIPS                 */}
                {/* ============================================================== */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-5 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Armchair className="w-4 h-4 text-[#0189FE]" />
                        <span>Interactive Dining Floor Plan</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time table occupancy for <strong>{date}</strong> at <strong>{time}</strong>. Hover any table for ambience details & tap to reserve.
                      </p>
                    </div>

                    {/* Clean Legend Badges */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Available</span>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-[#0189FE] border border-sky-200/60 dark:bg-sky-950/40 dark:text-sky-300">
                        <span className="w-2 h-2 rounded-full bg-[#0189FE]"></span>
                        <span>Selected</span>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span>Occupied</span>
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Small Capacity</span>
                      </span>
                    </div>
                  </div>

                  {/* Floor Plan Zones Layout */}
                  <div className="space-y-5">
                    {/* Helper to render each table with interactive hover tooltip */}
                    {(() => {
                      const renderTableItem = (table: FloorTable) => {
                        const occupancyInfo = tableOccupancy[table.id];
                        const isOccupied = !!occupancyInfo?.isOccupied;
                        const reservedBy = occupancyInfo?.reservedBy;
                        const isSelected = selectedTable?.id === table.id;
                        const isTooSmall = table.seats < partySize;
                        const isHovered = hoveredTable?.id === table.id;

                        return (
                          <div
                            key={table.id}
                            className="relative group"
                            onMouseEnter={() => setHoveredTable(table)}
                            onMouseLeave={() => setHoveredTable(null)}
                          >
                            <button
                              type="button"
                              onClick={() => handleTableClick(table)}
                              disabled={isOccupied || isTooSmall}
                              aria-label={`Table ${table.id}, ${table.name}, seats ${table.seats}${isOccupied ? `, reserved by ${reservedBy || 'Guest'}` : ', available'}`}
                              className={`w-full p-3 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between text-center relative cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0189FE] text-white border-[#0189FE] shadow-lg shadow-[#0189FE]/30 scale-[1.03] z-10'
                                  : isOccupied
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 opacity-70 cursor-not-allowed'
                                  : isTooSmall
                                  ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-[#0189FE] hover:shadow-md text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between text-[11px] font-black">
                                <span>{table.id}</span>
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isSelected
                                      ? 'bg-white'
                                      : isOccupied
                                      ? 'bg-rose-500'
                                      : isTooSmall
                                      ? 'bg-slate-400'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                              </div>
                              <div className="text-[11px] font-bold mt-1 truncate w-full">{table.name}</div>
                              <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {table.seats} seats
                              </div>
                            </button>

                            {/* Hover-sensitive Tooltip with Table Number, Capacity, and Reservation Name */}
                            <div
                              role="tooltip"
                              className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border border-slate-700/80 shadow-2xl transition-all duration-150 z-40 text-left ${
                                isHovered
                                  ? 'opacity-100 scale-100 translate-y-0 visible'
                                  : 'opacity-0 scale-95 translate-y-1 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:visible'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-700/80">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-[#0189FE] text-white">
                                    Table {table.id}
                                  </span>
                                  <span className="font-bold text-xs text-white truncate max-w-[90px]">
                                    {table.name}
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  {table.zone.replace('Santorini ', '')}
                                </span>
                              </div>

                              <div className="mt-2 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="text-[11px] text-slate-400">Capacity:</span>
                                  <span className="font-bold text-white text-[11px]">{table.seats} Guests Max</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">Status:</span>
                                  {isOccupied ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      Occupied
                                    </span>
                                  ) : isTooSmall ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                                      Too Small
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      Available
                                    </span>
                                  )}
                                </div>

                                {isOccupied && (
                                  <div className="pt-1.5 border-t border-slate-800">
                                    <span className="text-[10px] text-slate-400 block font-medium">Reservation Name:</span>
                                    <span className="text-xs font-bold text-amber-300 truncate block mt-0.5">
                                      👤 {reservedBy || 'Booked Guest'}
                                    </span>
                                  </div>
                                )}

                                {!isOccupied && !isTooSmall && (
                                  <div className="text-[10px] text-sky-300 font-medium pt-0.5">
                                    Click to select for {date} at {time}
                                  </div>
                                )}
                              </div>

                              {/* Downward triangle arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900/95" />
                            </div>
                          </div>
                        );
                      };

                      return (
                        <>
                          {/* Zone 1: Cloud Booths */}
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-[#0189FE]" />
                                <span>Zone A: Velvet Cloud Booths (6-Seater Family Booths)</span>
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">Acoustic periwinkle arches</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                              {boothTables.map(renderTableItem)}
                            </div>
                          </div>

                          {/* Zone 2: Santorini Arches & Zone 3: Bunny Garden */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Zone 2: Arches */}
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Zone B: Santorini Arches (4-Seater)</span>
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Street window view</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {archTables.map(renderTableItem)}
                              </div>
                            </div>

                            {/* Zone 3: Garden Center */}
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Zone C: Bunny Garden Center (4-Seater)</span>
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Mascot wall & blue florals</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {gardenTables.map(renderTableItem)}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* ============================================================== */}
                  {/* LIVE TABLE HOVER TOOLTIP CARD                                  */}
                  {/* ============================================================== */}
                  {hoveredTable && (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#0189FE] text-white">
                            Table {hoveredTable.id}
                          </span>
                          <h5 className="text-sm font-extrabold text-white">{hoveredTable.name}</h5>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">{hoveredTable.zone}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Capacity</span>
                          <span className="font-bold text-white">{hoveredTable.seats} Guests Max</span>
                        </div>

                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status</span>
                          <span className={`font-bold ${tableOccupancy[hoveredTable.id]?.isOccupied ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {tableOccupancy[hoveredTable.id]?.isOccupied ? 'Occupied' : 'Available to Book'}
                          </span>
                          {tableOccupancy[hoveredTable.id]?.isOccupied && (
                            <span className="block text-[11px] font-semibold text-amber-300 truncate mt-0.5">
                              👤 {tableOccupancy[hoveredTable.id]?.reservedBy || 'Booked Guest'}
                            </span>
                          )}
                        </div>

                        <div className="p-2 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ambience</span>
                          <span className="font-bold text-slate-200">
                            {hoveredTable.zone.includes('Booth')
                              ? 'Plush velvet, warm gold ring lamp'
                              : hoveredTable.zone.includes('Arches')
                              ? 'Periwinkle arch, window light'
                              : 'Floral hanging roses, mascot view'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-sky-300 font-medium pt-1">
                        {!tableOccupancy[hoveredTable.id]?.isOccupied && hoveredTable.seats >= partySize
                          ? '👉 Click this table to lock it in for your reservation'
                          : tableOccupancy[hoveredTable.id]?.isOccupied
                          ? `🔒 Table ${hoveredTable.id} is occupied by ${tableOccupancy[hoveredTable.id]?.reservedBy || 'another guest'} for ${time}`
                          : '⚠️ This table accommodates up to ' + hoveredTable.seats + ' guests (party size is ' + partySize + ')'}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Selection Summary */}
                  {selectedTable && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#0189FE]/40 shadow-xs flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          Selected Spot: <strong>{selectedTable.id} – {selectedTable.name}</strong> ({selectedTable.zone}, {selectedTable.seats} guests)
                        </span>
                      </div>
                      <span className="font-extrabold text-[#0189FE] hidden sm:inline">
                        Locked for Booking ✓
                      </span>
                    </div>
                  )}
                </div>

                {/* Slot Capacity Meter */}
                <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2F5E9E] dark:text-sky-300">
                    Slot Status for {date} at {time}:
                  </span>
                  <span className={`font-black ${isSlotFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isSlotFull ? 'Full (0 seats left)' : `${seatsRemaining} seats available (${RESTAURANT_TABLES.filter(t => !tableOccupancy[t.id]?.isOccupied).length} tables free)`}
                  </span>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Tariq Afridi"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Mobile Number (03xx-xxxxxxx)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    />
                  </div>
                </div>

                {/* Occasion & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Occasion
                    </label>
                    <select
                      value={occasion}
                      onChange={e => setOccasion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    >
                      <option value="Family Dinner">Family Dinner</option>
                      <option value="Birthday Celebration">Birthday Celebration 🎂</option>
                      <option value="Anniversary">Anniversary 💍</option>
                      <option value="Friends Hangout">Friends Hangout 🍕</option>
                      <option value="Casual Bite">Casual Late Night Bite</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2F5E9E] dark:text-sky-300 uppercase block mb-1">
                      Notes / High Chair Request (Optional)
                    </label>
                    <input
                      type="text"
                      value={specialRequests}
                      onChange={e => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Need 1 high chair for toddler"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSlotFull || !selectedTable}
                  className={`mt-2 py-3.5 px-6 rounded-full font-black text-sm text-white shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                    isSlotFull || !selectedTable
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#0189FE] to-[#2F5E9E] hover:from-[#2F5E9E] hover:to-[#0189FE]'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    Confirm Table {selectedTable ? selectedTable.id : ''} Reservation (Instant BB-R-XXXX Code)
                  </span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Manage Tab */
          <div className="boutique-card p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-2">
              Find & Manage Your Booking
            </h3>
            <p className="text-xs text-[#1F2430]/75 dark:text-gray-300 mb-5">
              Enter your reservation code (e.g. BB-R-7A9B) and the phone number used to book.
            </p>

            <form onSubmit={handleLookupManage} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={manageCode}
                onChange={e => setManageCode(e.target.value)}
                placeholder="Code (e.g. BB-R-XXXX)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm uppercase focus:ring-2 focus:ring-[#0189FE]"
              />
              <input
                type="tel"
                required
                value={managePhone}
                onChange={e => setManagePhone(e.target.value)}
                placeholder="Phone (0300...)"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#0189FE]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#0189FE] text-white hover:bg-[#2F5E9E] transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </form>

            {manageResult && (
              <div className="mt-6 pt-6 border-t border-[#8DBCE8]/30">
                {manageResult.found ? (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-sky-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-[#2F5E9E] dark:text-white">
                          {manageResult.found.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          manageResult.found.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {manageResult.found.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Guest: {manageResult.found.customerName} • {manageResult.found.partySize} Guests
                      </p>
                      {manageResult.found.tableNumber && (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                          Assigned Table: {manageResult.found.tableNumber} {manageResult.found.tableName ? `(${manageResult.found.tableName})` : ''}
                        </p>
                      )}
                      <p className="text-xs text-[#0189FE] font-bold">
                        {manageResult.found.date} at {manageResult.found.time} ({manageResult.found.occasion})
                      </p>
                    </div>

                    {manageResult.found.status === 'Confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(manageResult.found!)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-300 transition-all cursor-pointer"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {manageResult.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
