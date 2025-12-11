import React from 'react';
import { ChevronLeft, ChevronRight, Settings, Cloud, RefreshCw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { MONTH_NAMES } from '../constants';
import { formatDateDDMMYYYY } from '../services/utils/dateFormatter';


interface DateStripProps {
    selectedYear: number;
    setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
    selectedMonth: number;
    setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
    selectedDay: number;
    setSelectedDay: React.Dispatch<React.SetStateAction<number>>;
    currentDateString: string;
    daysInMonth: number;
    existingDaysInMonth: number[];
    onOpenBedManager?: () => void;
    syncStatus?: 'idle' | 'saving' | 'saved' | 'error';
    lastSyncTime?: Date | null;
}

export const DateStrip: React.FC<DateStripProps> = ({
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    selectedDay, setSelectedDay,
    currentDateString,
    daysInMonth,
    existingDaysInMonth,
    onOpenBedManager,
    syncStatus,
    lastSyncTime
}) => {
    const changeMonth = (delta: number) => {
        let newM = selectedMonth + delta;
        let newY = selectedYear;
        if (newM > 11) { newM = 0; newY++; }
        if (newM < 0) { newM = 11; newY--; }
        setSelectedMonth(newM);
        setSelectedYear(newY);
        setSelectedDay(1);
    };

    // Check if today is selected
    const today = new Date();
    const isCurrentDate = today.getDate() === selectedDay &&
        today.getMonth() === selectedMonth &&
        today.getFullYear() === selectedYear;

    const displayDate = formatDateDDMMYYYY(currentDateString);

    return (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[60px] z-40 print:hidden">
            <div className="max-w-screen-2xl mx-auto px-4 py-1.5">
                <div className="flex items-center gap-3">
                    {/* Year Selector */}
                    <div className="flex items-center text-slate-700 font-bold shrink-0">
                        <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-slate-100 rounded">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="mx-1 text-sm font-bold">{selectedYear}</span>
                        <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-slate-100 rounded">
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>

                    {/* Month Selector */}
                    <div className="flex items-center text-slate-700 font-bold shrink-0">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded">
                            <ChevronLeft size={14} />
                        </button>
                        <span className="mx-1 uppercase text-xs tracking-wide min-w-[80px] text-center">{MONTH_NAMES[selectedMonth]}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded">
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>

                    {/* Day Strip - 17 days centered on selected day */}
                    <div className="flex gap-1 py-1">
                        {(() => {
                            // Calculate visible range: 8 days before + selected + 8 days after = 17 days
                            const VISIBLE_DAYS = 17;
                            const OFFSET = 8;

                            let startDay = selectedDay - OFFSET;
                            let endDay = selectedDay + OFFSET;

                            // Adjust if we're near the start of the month
                            if (startDay < 1) {
                                startDay = 1;
                                endDay = Math.min(VISIBLE_DAYS, daysInMonth);
                            }

                            // Adjust if we're near the end of the month
                            if (endDay > daysInMonth) {
                                endDay = daysInMonth;
                                startDay = Math.max(1, daysInMonth - VISIBLE_DAYS + 1);
                            }

                            const days = [];
                            for (let day = startDay; day <= endDay; day++) {
                                const hasData = existingDaysInMonth.includes(day);
                                const isSelected = day === selectedDay;
                                const isTodayReal = today.getDate() === day &&
                                    today.getMonth() === selectedMonth &&
                                    today.getFullYear() === selectedYear;

                                days.push(
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={clsx(
                                            "flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-all shrink-0 relative border",
                                            isSelected
                                                ? "bg-slate-800 text-white border-slate-800 shadow-md scale-110"
                                                : [
                                                    "hover:bg-slate-100",
                                                    isTodayReal
                                                        ? "bg-blue-50 border-blue-300 text-blue-600"
                                                        : "bg-white border-slate-100 text-slate-500"
                                                ]
                                        )}
                                    >
                                        <span>{day}</span>
                                        {hasData && (
                                            <span className={clsx(
                                                "absolute -bottom-0.5 w-1 h-1 rounded-full",
                                                isSelected ? "bg-green-400" : "bg-green-500"
                                            )}></span>
                                        )}
                                    </button>
                                );
                            }
                            return days;
                        })()}
                    </div>

                    <div className="h-5 w-px bg-slate-200"></div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Go to Today Button */}
                        {!isCurrentDate && (
                            <button
                                onClick={() => {
                                    setSelectedYear(today.getFullYear());
                                    setSelectedMonth(today.getMonth());
                                    setSelectedDay(today.getDate());
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold transition-colors border border-blue-100"
                                title="Volver a la fecha de hoy"
                            >
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                Hoy
                            </button>
                        )}

                        {/* Sync Status */}
                        {syncStatus && (
                            <div className="flex items-center gap-1 text-[10px] font-medium"
                                title={`Última sincronización: ${lastSyncTime?.toLocaleTimeString() || 'Nunca'}`}>
                                {syncStatus === 'saving' && <RefreshCw size={10} className="animate-spin text-blue-500" />}
                                {syncStatus === 'saved' && <Cloud size={10} className="text-green-500" />}
                                {syncStatus === 'error' && <AlertTriangle size={10} className="text-red-500" />}
                            </div>
                        )}

                        {/* Bed Manager Button */}
                        {onOpenBedManager && (
                            <button
                                onClick={onOpenBedManager}
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded border border-slate-200 transition-colors"
                                title="Gestionar Camas"
                            >
                                <Settings size={12} />
                            </button>
                        )}

                        {/* Date Display */}
                        <div className="text-slate-400 text-[10px] font-mono hidden lg:block">
                            {displayDate}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};