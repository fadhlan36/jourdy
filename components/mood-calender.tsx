"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMoodConfig } from "./dashboard/config";

const MOOD_LEGEND = [
  { label: "Senang", dot: "bg-yellow-400" },
  { label: "Sedih", dot: "bg-blue-400" },
  { label: "Marah", dot: "bg-red-400" },
  { label: "Cemas", dot: "bg-purple-400" },
  { label: "Netral", dot: "bg-slate-300" },
];

interface MoodCalendarProps {
  calendarKey?: number;
}

export function MoodCalendar({ calendarKey = 0 }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [journals, setJournals] = useState<any[]>([]);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setJournals(data);
    } catch (err) {
      console.error("MoodCalendar: gagal fetch jurnal", err);
    }
  };

  // Re-fetch data setiap kali calendarKey dari parent berubah
  useEffect(() => {
    fetchJournals();
  }, [calendarKey]);

  const getMoodsForDate = (date: Date) => {
    if (!journals.length) return [];

    return (
      journals
        .filter((j: any) => {
          const raw = j.created_at ?? j.createdAt;
          if (!raw) return false;
          return isSameDay(new Date(raw), date);
        })
        .sort(
          (a: any, b: any) =>
            new Date(a.created_at ?? a.createdAt).getTime() -
            new Date(b.created_at ?? b.createdAt).getTime(),
        )
        .map((j: any) => ({ mood: j.mood, config: getMoodConfig(j.mood) }))
        .filter((item) => item.config)
        // Hilangkan duplikat mood di hari yang sama agar dot tidak menumpuk
        .filter(
          (item, index, arr) =>
            arr.findIndex((x) => x.mood === item.mood) === index,
        )
        .map((item) => item.config)
    );
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-500 mb-0.5">
          Mood History
        </span>
        <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
      </div>
      <div className="flex gap-0.5 bg-slate-100/50 p-0.5 rounded-lg border border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-500"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-[8px] font-black uppercase tracking-widest text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = new Date(day);
        const moods = getMoodsForDate(cloneDay);
        const activeToday = isToday(cloneDay);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className="relative aspect-square flex flex-col items-center justify-center py-1"
          >
            {/* Highlight Hari Ini */}
            {activeToday && isCurrentMonth && (
              <div className="absolute inset-[1px] rounded-lg bg-indigo-50 border border-indigo-100" />
            )}

            <span
              className={`relative z-10 text-[11px] font-bold tracking-tight leading-none ${
                !isCurrentMonth
                  ? "text-slate-200"
                  : activeToday
                    ? "text-indigo-600"
                    : "text-slate-600"
              }`}
            >
              {formattedDate}
            </span>

            {/* Titik-titik Mood */}
            {moods.length > 0 && isCurrentMonth && (
              <div className="relative z-10 flex gap-0.5 mt-1 justify-center flex-wrap px-0.5">
                {moods.slice(0, 4).map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full shadow-sm ${m.dot}`}
                  />
                ))}
              </div>
            )}

            {activeToday && isCurrentMonth && (
              <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-indigo-500 z-10" />
            )}
          </div>,
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-0.5" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderLegend = () => (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
        Keterangan
      </p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        {MOOD_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full shrink-0 shadow-sm ${item.dot}`}
            />
            <span className="text-[10px] font-bold text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full select-none max-w-[280px] mx-auto bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderLegend()}
    </div>
  );
}
