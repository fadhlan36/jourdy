"use client";
import {
  Loader2,
  RefreshCw,
  BrainCircuit,
  Calendar as CalendarIcon,
  TrendingUp,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { MoodCalendar } from "../mood-calender";

export function InsightsPanel({
  calendarKey,
  weeklyInsight,
  isLoadingInsight,
  onRefreshInsight,
}: any) {
  return (
    <aside className="w-full lg:w-[620px] lg:h-full bg-[#f8fafc] lg:bg-white/40 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-slate-200/60 flex flex-col shrink-0 z-20 overflow-visible lg:overflow-hidden pb-10 lg:pb-0">
      {/* SECTION: MOOD HISTORY */}
      <div className="p-8 lg:p-10 border-b border-slate-100/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CalendarIcon size={18} />
            </div>
            <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-[0.15em]">
              Mood History
            </h3>
          </div>
        </div>

        {/* FIX: padding lebih besar, shadow lebih tegas, rounded lebih besar */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 border border-white">
          <MoodCalendar key={calendarKey} />
        </div>
      </div>

      {/* SECTION: WEEKLY INSIGHT */}
      <div className="p-8 lg:p-10 flex-1 lg:overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <BrainCircuit size={18} />
            </div>
            <h3 className="text-[13px] font-black text-slate-500 uppercase tracking-[0.15em]">
              Weekly Insight
            </h3>
          </div>
          <button
            onClick={onRefreshInsight}
            disabled={isLoadingInsight}
            className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-100"
          >
            <RefreshCw
              size={18}
              className={isLoadingInsight ? "animate-spin" : ""}
            />
          </button>
        </div>

        {isLoadingInsight ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={36} />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Generating Analysis...
            </p>
          </div>
        ) : weeklyInsight ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Mental Clarity */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-indigo-500/80 uppercase tracking-widest flex items-center gap-2 px-1">
                <TrendingUp size={14} /> Mental Clarity
              </label>
              <div className="p-6 lg:p-7 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                <p className="text-sm lg:text-base font-bold text-slate-700 leading-relaxed">
                  {weeklyInsight.emotionalState}
                </p>
              </div>
            </div>

            {/* Recurring Patterns */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-emerald-500/80 uppercase tracking-widest flex items-center gap-2 px-1">
                <Sparkles size={14} /> Recurring Patterns
              </label>
              <div className="p-6 lg:p-7 rounded-[2rem] bg-emerald-50/30 border border-emerald-100/50">
                <p className="text-sm lg:text-base font-bold text-slate-600 leading-relaxed italic">
                  "{weeklyInsight.patterns}"
                </p>
              </div>
            </div>

            {/* Daily Guidance */}
            <div className="relative group mt-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.2rem] blur opacity-15" />
              <div className="relative bg-slate-900 rounded-[2rem] p-8 lg:p-10 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <Lightbulb size={20} className="text-yellow-300" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                    Daily Guidance
                  </label>
                </div>
                <p className="text-sm lg:text-base font-medium leading-relaxed text-indigo-50/90">
                  {weeklyInsight.recommendation}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-400">
              Tulis jurnal untuk membuka insight.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
