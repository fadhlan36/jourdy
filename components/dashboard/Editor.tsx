"use client";
import {
  Cloud,
  Loader2,
  Menu,
  PenLine,
  Smile,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getMoodConfig, categoryColor, CATEGORIES } from "./config";

export function Editor({
  text,
  setText,
  status,
  mood,
  isAnalyzingMood,
  category,
  setCategory,
  isCategoryOpen,
  setIsCategoryOpen,
  journalId,
  isRefining,
  userEmail,
  isSidebarOpen,
  setIsSidebarOpen,
  onAIPreview,
}: any) {
  const mc = getMoodConfig(mood);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <main className="flex-1 flex flex-col relative z-10">
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 bg-white/50">
            {status === "Saving..." ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Cloud size={13} />
            )}{" "}
            <span>{status}</span>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/50 rounded-xl border border-slate-100 text-[11px] font-black text-slate-700 truncate max-w-[150px]">
          {userEmail?.split("@")[0]}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center p-4 md:p-10">
        {/* Diperlebar ke max-w-5xl */}
        <div className="w-full max-w-5xl mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-400 font-black text-[12px] uppercase tracking-widest">
            <div className="h-px w-8 bg-slate-300" />
            <PenLine size={16} />
            {journalId ? "Editing" : "New Entry"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {journalId ? "Lanjutkan ceritamu." : "Apa yang kamu rasakan?"}
          </h1>
        </div>

        <div className="w-full max-w-5xl relative bg-white border border-slate-100 rounded-[2.5rem] shadow-xl flex flex-col min-h-[500px]">
          <div className="flex flex-wrap gap-3 p-8 pb-0">
            <div
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[12px] font-black uppercase tracking-widest transition-all shadow-sm ${mc.pill}`}
            >
              {isAnalyzingMood ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Smile size={18} />
              )}{" "}
              {mood}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-100 text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${categoryColor[category]}`}
                />{" "}
                {category} <ChevronDown size={14} />
              </button>
              {isCategoryOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCategoryOpen(false)}
                  />
                  <div className="absolute top-14 left-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${category === cat ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50 text-slate-500"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis apa saja..."
            className="w-full bg-transparent border-none text-xl md:text-3xl p-8 pb-20 resize-none flex-1 focus-visible:ring-0 font-medium"
          />

          <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30 rounded-b-[2.5rem]">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <span>{wordCount} Words</span>
            </div>

            <button
              onClick={onAIPreview}
              disabled={!text.trim() || isRefining}
              className={`px-7 py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest flex items-center gap-3 transition-all ${text.trim() ? "bg-indigo-600 text-white hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-300"}`}
            >
              {isRefining ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}{" "}
              AI Tidy Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
