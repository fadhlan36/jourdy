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

export function MoodCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [journals, setJournals] = useState<any[]>([]);

  useEffect(() => {
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

    fetchJournals();

    const handleUpdate = () => fetchJournals();
    window.addEventListener("journalUpdated", handleUpdate);
    return () => window.removeEventListener("journalUpdated", handleUpdate);
  }, []);

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
        // FIX: deduplikasi mood yang sama — 1 mood = 1 dot
        .map((j: any) => ({ mood: j.mood, config: getMoodConfig(j.mood) }))
        .filter((item) => item.config)
        .filter(
          (item, index, arr) =>
            arr.findIndex((x) => x.mood === item.mood) === index,
        )
        .map((item) => item.config)
    );
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6 px-2">
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
          Mood History
        </span>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
      </div>
      <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-3">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400"
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
            className="relative aspect-square flex flex-col items-center justify-center"
          >
            {activeToday && isCurrentMonth && (
              <div className="absolute inset-0 rounded-xl bg-indigo-50 border border-indigo-100" />
            )}

            <span
              className={`relative z-10 text-sm font-bold tracking-tight leading-none ${
                !isCurrentMonth
                  ? "text-slate-200"
                  : activeToday
                    ? "text-indigo-600"
                    : "text-slate-600"
              }`}
            >
              {formattedDate}
            </span>

            {moods.length > 0 && isCurrentMonth && (
              <div className="relative z-10 flex gap-1 md:gap-0.5 mt-1.5 justify-center flex-wrap">
                {moods.slice(0, 4).map((m, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full shadow-sm ${m.dot}`}
                  />
                ))}
              </div>
            )}

            {activeToday && isCurrentMonth && (
              <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 z-10" />
            )}
          </div>,
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderLegend = () => (
    <div className="mt-5 pt-4 border-t border-slate-100">
      <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
        Keterangan
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {MOOD_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full shrink-0 shadow-sm ${item.dot}`}
            />
            <span className="text-xs font-bold text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full select-none">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {renderLegend()}
    </div>
  );
}
