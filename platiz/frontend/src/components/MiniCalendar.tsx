import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

interface Props {
  value: string;
  onChange: (date: string) => void;
  min?: string;
}

export default function MiniCalendar({ value, onChange, min }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T12:00:00') : today);
  const [open, setOpen] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const minDate = min ? new Date(min + 'T00:00:00') : null;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDate = (day: number) => {
    const d = new Date(year, month, day);
    const iso = d.toISOString().split('T')[0];
    onChange(iso);
    setOpen(false);
  };

  const isDisabled = (day: number) => minDate && new Date(year, month, day) < minDate;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = new Date(value + 'T12:00:00');
    return day === d.getDate() && month === d.getMonth() && year === d.getFullYear();
  };

  const displayDate = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Seleccionar fecha';

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-xl text-white text-sm text-left hover:border-[#FFD700]/30 focus:border-[#FFD700]/40 focus:outline-none transition-colors flex items-center justify-between">
        <span className={value ? 'text-white' : 'text-gray-500'}>{displayDate}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2"/></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-2 w-72 bg-[#0a0a0f] border border-[#FFD700]/15 rounded-2xl shadow-2xl shadow-black/60 p-4 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors"><HiChevronLeft className="w-5 h-5" /></button>
              <span className="text-white font-semibold text-sm">{MONTHS[month]} {year}</span>
              <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors"><HiChevronRight className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-gray-600 uppercase py-1">{d}</div>)}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDisabled(day) || false;
                return (
                  <button key={day} type="button" disabled={disabled}
                    onClick={() => !disabled && selectDate(day)}
                    className={`text-center py-2 text-sm rounded-xl transition-all duration-150 font-medium
                      ${disabled ? 'text-gray-700 cursor-not-allowed' : ''}
                      ${isSelected(day) ? 'bg-[#FFD700] text-black font-bold shadow-[0_0_12px_rgba(255,215,0,0.3)]' : ''}
                      ${!isSelected(day) && !disabled ? 'text-gray-300 hover:bg-white/[0.06] hover:text-white' : ''}
                      ${isToday(day) && !isSelected(day) ? 'border border-[#FFD700]/30' : ''}`}>
                    {day}
                  </button>
                );
              })}
            </div>

            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
              Limpiar fecha
            </button>
          </div>
        </>
      )}
    </div>
  );
}
