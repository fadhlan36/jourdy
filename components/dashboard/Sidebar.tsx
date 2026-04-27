"use client";
import {
  Plus,
  LogOut,
  Sparkles,
  X,
  Folder,
  ChevronDown,
  Search,
} from "lucide-react";
import { categoryColor, getMoodConfig } from "./config";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  groupedJournals,
  collapsedCategories,
  toggleCategoryCollapse,
  journalId,
  searchQuery,
  setSearchQuery,
  onNewEntry,
  onSelectJournal,
}: any) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      className={`fixed lg:relative h-full z-[50] transition-all duration-500 bg-white lg:bg-[#eff6ff]/80 backdrop-blur-md border-r border-slate-200 flex flex-col overflow-hidden ${
        isSidebarOpen
          ? "w-[400px] translate-x-0"
          : "w-0 -translate-x-full lg:translate-x-0 lg:w-[400px]"
      }`}
    >
      {/* HEADER */}
      <div className="p-7 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">
            JOURDY
          </span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 lg:hidden text-slate-400 hover:bg-slate-100 rounded-full"
        >
          <X size={24} />
        </button>
      </div>

      {/* NEW ENTRY BUTTON */}
      <div className="px-6 mb-5">
        <button
          onClick={onNewEntry}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[14px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-indigo-100"
        >
          <Plus size={20} /> New Journal
        </button>
      </div>

      {/* SEARCH */}
      <div className="px-6 mb-8">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari jurnal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* JOURNAL LIST */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20 custom-scrollbar">
        {Object.entries(groupedJournals).map(([cat, items]: any) => (
          <div key={cat} className="space-y-1">
            <button
              onClick={() => toggleCategoryCollapse(cat)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-slate-600 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Folder
                  size={14}
                  className={categoryColor[cat] || "text-slate-400"}
                />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {cat} ({items.length})
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${
                  collapsedCategories.has(cat) ? "-rotate-90" : ""
                }`}
              />
            </button>

            {!collapsedCategories.has(cat) && (
              <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
                {items.map((j: any) => {
                  const mc = getMoodConfig(j.mood);

                  // PERBAIKAN LOGIKA TANGGAL DISINI
                  const dateSource = j.createdAt || j.created_at;
                  const entryDate = dateSource
                    ? typeof dateSource === "string"
                      ? parseISO(dateSource)
                      : new Date(dateSource)
                    : null;

                  return (
                    <button
                      key={j.id}
                      onClick={() => onSelectJournal(j)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        journalId === j.id
                          ? "bg-white shadow-md ring-1 ring-slate-100"
                          : "hover:bg-white/50"
                      }`}
                    >
                      <div className="flex flex-col gap-2 relative z-10">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {entryDate
                              ? format(entryDate, "MMM d, HH:mm")
                              : "No Date"}
                          </span>
                          <div className={`h-2 w-2 rounded-full ${mc.dot}`} />
                        </div>
                        <p
                          className={`text-sm font-bold truncate ${
                            journalId === j.id
                              ? "text-slate-900"
                              : "text-slate-500"
                          }`}
                        >
                          {j.content || "Untitled Entry"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-black text-[12px] uppercase tracking-widest"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
