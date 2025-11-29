import { useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  ArrowLeft,
  Calendar as CalendarIcon,
  Info,
} from 'lucide-react';
import type { Room, RoomAvailability } from '../../../types/host';
import {
  getRoomAvailability,
  updateRoomAvailability,
} from '../../../services/hostService';
import { toast } from 'sonner';

interface AvailabilityCalendarProps {
  room: Room;
  onBack: () => void;
}

export default function AvailabilityCalendar({
  room,
  onBack,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Range Selection State
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const start = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      const data = await getRoomAvailability(room.id, start, end);
      setAvailability(data);
    } catch (error) {
      console.error('Failed to load availability', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [currentDate, room.id]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const getDayData = (date: Date) => {
    const dateStr = formatDate(date);
    return availability.find((a) => a.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    if (!selectionStart || (selectionStart && selectionEnd)) {
      // Start new selection
      setSelectionStart(date);
      setSelectionEnd(null);
    } else {
      // Complete selection
      let start = selectionStart;
      let end = date;

      if (date < selectionStart) {
        start = date;
        end = selectionStart;
      }

      setSelectionStart(start);
      setSelectionEnd(end);

      // Open modal automatically when range is selected
      setShowEditModal(true);

      // Pre-fill price from the first selected day (start date)
      const data = getDayData(start);
      setEditPrice(data?.customPrice?.toString() || room.basePrice.toString());
      setEditAvailable(data ? data.isAvailable : true);
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selectionStart) return false;
    if (selectionEnd) {
      return date >= selectionStart && date <= selectionEnd;
    }
    return date.getTime() === selectionStart.getTime();
  };

  const handleSave = async () => {
    if (!selectionStart) return;

    setIsSaving(true);
    try {
      const start = selectionStart;
      const end = selectionEnd || selectionStart;
      const datesToUpdate: string[] = [];

      // Generate all dates in range
      // Clone start date to avoid modifying state
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        datesToUpdate.push(formatDate(new Date(d)));
      }

      // Update each date
      await Promise.all(
        datesToUpdate.map((dateStr) =>
          updateRoomAvailability(
            room.id,
            dateStr,
            editAvailable,
            editPrice ? parseFloat(editPrice) : undefined
          )
        )
      );

      toast.success(`Updated ${datesToUpdate.length} dates`);
      setShowEditModal(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      loadAvailability();
    } catch (error) {
      console.error('Failed to update availability', error);
      toast.error('Failed to update availability');
    } finally {
      setIsSaving(false);
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Availability Calendar
            </h2>
            <p className="text-slate-500 font-medium">
              {room.name} - Base Price: ${room.basePrice}
            </p>
          </div>
        </div>

        {/* Legends */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>
            Available
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></div>
            Closed
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-3 h-3 bg-brand-accent rounded-sm"></div>
            Selected
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm select-none">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-accent" />
            {monthName}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-slate-50 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, idx) => {
                if (!date)
                  return <div key={`empty-${idx}`} className="aspect-square" />;

                const data = getDayData(date);
                const isAvailable = data ? data.isAvailable : true;
                const price = data?.customPrice || room.basePrice;
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const selected = isDateSelected(date);

                return (
                  <button
                    key={idx}
                    onClick={() => !isPast && handleDayClick(date)}
                    disabled={isPast}
                    className={`
                      relative aspect-square rounded-xl border p-1 flex flex-col items-center justify-center transition-all duration-200
                      ${isPast ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                      ${selected ? 'bg-brand-accent text-white border-brand-accent shadow-lg scale-105 z-10' : ''}
                      ${!selected && !isAvailable && !isPast ? 'bg-red-50 border-red-200 hover:border-red-300' : ''}
                      ${!selected && isAvailable && !isPast ? 'bg-white border-slate-200 hover:border-brand-accent' : ''}
                    `}
                  >
                    <span
                      className={`text-sm font-bold ${!selected && !isAvailable && !isPast ? 'text-red-500' : ''}`}
                    >
                      {date.getDate()}
                    </span>
                    {!isPast && (
                      <div
                        className={`text-xs font-medium mt-1 ${selected ? 'text-white/90' : 'text-slate-500'}`}
                      >
                        ${price}
                      </div>
                    )}
                    {!isAvailable && !isPast && !selected && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Info className="w-4 h-4" />
          Click a date to select start, click another to select end. Range
          selection supported.
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                Edit Availability
                {selectionStart && (
                  <span className="block text-xs font-normal text-slate-500 mt-1">
                    {formatDate(selectionStart)}
                    {selectionEnd && ` to ${formatDate(selectionEnd)}`}
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectionStart(null);
                  setSelectionEnd(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer group">
                    <input
                      type="radio"
                      className="peer hidden"
                      checked={editAvailable}
                      onChange={() => setEditAvailable(true)}
                    />
                    <div className="text-center py-3 rounded-xl border-2 border-slate-200 peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700 font-bold transition-all group-hover:border-slate-300">
                      Open
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer group">
                    <input
                      type="radio"
                      className="peer hidden"
                      checked={!editAvailable}
                      onChange={() => setEditAvailable(false)}
                    />
                    <div className="text-center py-3 rounded-xl border-2 border-slate-200 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700 font-bold transition-all group-hover:border-slate-300">
                      Closed
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Price per Night ($)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all font-bold text-lg"
                  placeholder={room.basePrice.toString()}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold rounded-xl shadow-lg shadow-brand-cta/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
