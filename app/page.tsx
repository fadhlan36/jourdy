"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  LogOut,
  Sparkles,
  Menu,
  X,
  Cloud,
  Check,
  PenLine,
  Loader2,
  Smile,
  Folder,
  Hash,
  ChevronDown,
  Search,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { MoodCalendar } from "@/components/mood-calender";

export default function Home() {
  const [text, setText] = useState("");
  const [journals, setJournals] = useState<any[]>([]);
  const [status, setStatus] = useState("Ready");
  const [journalId, setJournalId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Personal");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categories = ["Personal", "Work", "Ideas", "Urgent"];

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isRefining, setIsRefining] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [refinedText, setRefinedText] = useState("");
  const [mood, setMood] = useState("Netral");
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  const router = useRouter();
  const isSaving = useRef(false);
  const lastMoodCheck = useRef(0);
  const lastContentAnalyzed = useRef("");
  const currentCategory = useRef(category);
  const currentMood = useRef(mood);

  // Sinkronkan Ref agar auto-save selalu punya data terbaru
  useEffect(() => {
    currentCategory.current = category;
  }, [category]);
  useEffect(() => {
    currentMood.current = mood;
  }, [mood]);

  const groupedJournals = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    const filtered = journals.filter((j) =>
      j.content?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    filtered.forEach((j) => {
      const cat = j.category || "Personal";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(j);
    });
    return groups;
  }, [journals, searchQuery]);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setJournals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil jurnal:", err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        await fetchJournals();
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [router]);

  // --- FUNGSI DETEKSI MOOD (SMART & RESPONSIVE) ---
  const detectMood = async (
    content: string,
    id: string | null,
    force = false,
  ) => {
    if (content.length < 15 || !id || isAnalyzingMood) return;

    // Jika konten sama persis dengan scan terakhir AI, stop.
    if (content === lastContentAnalyzed.current && !force) return;

    const now = Date.now();
    const isInitialCheck = lastContentAnalyzed.current === "";
    const timeSinceLast = now - lastMoodCheck.current;
    const charDiff = Math.abs(
      content.length - lastContentAnalyzed.current.length,
    );

    // Logika Pintar:
    // Izinkan scan jika: Baru buka (Initial) OR Paksa (Force)
    // OR (Sudah lewat 15 detik DAN ada perubahan teks)
    // OR (Belum 15 detik TAPI ngetik banyak banget > 20 karakter)
    if (!force && !isInitialCheck && timeSinceLast < 15000 && charDiff < 20) {
      return;
    }

    lastMoodCheck.current = now;
    lastContentAnalyzed.current = content;
    setIsAnalyzingMood(true);

    try {
      const res = await fetch("/api/ai/analyze-mood", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      const detectedMood = data.mood || "Netral";

      // Sinkronkan state dan ref mood segera
      setMood(detectedMood);
      currentMood.current = detectedMood;

      // Update Database langsung agar mood tidak hilang saat refresh
      await fetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          category: currentCategory.current,
          mood: detectedMood,
        }),
      });

      setJournals((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                mood: detectedMood,
                content,
                category: currentCategory.current,
              }
            : j,
        ),
      );
    } catch (err) {
      console.error("Gagal deteksi mood:", err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  // --- AUTO-SAVE EFFECT ---
  useEffect(() => {
    if (!text.trim() || isSaving.current) return;

    const timeout = setTimeout(async () => {
      setStatus("Saving...");
      isSaving.current = true;

      try {
        if (!journalId) {
          const res = await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text, category, mood: "Netral" }),
          });
          const data = await res.json();
          if (data?.id) {
            setJournalId(data.id);
            setJournals((prev) => [data, ...prev]);
            detectMood(text, data.id, true);
          }
        } else {
          const res = await fetch(`/api/journal/${journalId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: text,
              category,
              mood: currentMood.current, // Menggunakan mood terbaru dari ref
            }),
          });

          if (res.ok) {
            setJournals((prev) =>
              prev.map((j) =>
                j.id === journalId ? { ...j, content: text, category } : j,
              ),
            );
            detectMood(text, journalId);
          }
        }
        setStatus("Saved");
      } catch (err) {
        setStatus("Error");
      } finally {
        isSaving.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [text, category, journalId]);

  const handleAIPreview = async () => {
    if (!text.trim() || text.length < 10) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/ai/tidy-up", {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.refinedText) {
        setRefinedText(data.refinedText);
        setShowComparison(true);
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefinement = () => {
    setText(refinedText);
    setShowComparison(false);
    if (journalId) detectMood(refinedText, journalId, true);
  };

  const startNewEntry = () => {
    setText("");
    setJournalId(null);
    setCategory("Personal");
    setMood("Netral");
    currentMood.current = "Netral";
    setStatus("Ready");
    setIsSidebarOpen(false);
    lastMoodCheck.current = 0;
    lastContentAnalyzed.current = "";
  };

  if (checkingAuth) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden antialiased text-[#444746]">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#F8FAFD] border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Sparkles className="h-5 w-5 text-white fill-white/20" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#1F1F1F]">
              Jourdy
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-5 mb-6 shrink-0 space-y-3">
          <Button
            onClick={startNewEntry}
            className="w-full flex items-center justify-center gap-3 py-7 bg-[#C2E7FF] hover:bg-[#B3D7EF] text-[#001D35] rounded-[1.25rem] shadow-sm transition-all font-semibold text-sm border-none"
          >
            <Plus className="h-5 w-5" />
            <span>New Entry</span>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all group border border-transparent hover:border-slate-100">
                <div className="p-2 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 rounded-lg transition-colors">
                  <CalendarDays size={18} />
                </div>
                <span className="text-sm font-semibold">Mood Calendar</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-none outline-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center text-slate-800 mb-2">
                  Your Mood Journey
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Statistik harian kamu.
                </DialogDescription>
              </DialogHeader>
              <MoodCalendar />
            </DialogContent>
          </Dialog>
        </div>

        <div className="px-5 mb-6 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jurnal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <p className="px-9 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Organization
          </p>
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            {Object.entries(groupedJournals).map(([catName, items]) => (
              <div key={catName} className="mb-6">
                <div className="flex items-center gap-2 px-5 mb-2">
                  <Folder className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-600 uppercase">
                    {catName}
                  </span>
                </div>
                <div className="space-y-1">
                  {items.map((j) => (
                    <button
                      key={j.id}
                      onClick={() => {
                        setJournalId(j.id);
                        setText(j.content);
                        setCategory(j.category || "Personal");

                        // SINKRONISASI MOOD SAAT KLIK SIDEBAR
                        setMood(j.mood || "Netral");
                        currentMood.current = j.mood || "Netral";

                        setIsSidebarOpen(false);

                        // RESET TRACKER AGAR AI SIAP SCAN ULANG SAAT DIEDIT
                        lastContentAnalyzed.current = "";
                        lastMoodCheck.current = 0;
                      }}
                      className={`w-full text-left px-5 py-3 rounded-xl transition-all flex items-start gap-3 ${journalId === j.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`}
                    >
                      <Hash
                        className={`h-3 w-3 mt-1 shrink-0 ${journalId === j.id ? "text-indigo-400" : "text-slate-300"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 font-medium text-[13px]">
                          {j.content || "Empty thought"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] opacity-50">
                            {new Date(j.created_at).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${
                              j.mood === "Senang"
                                ? "bg-yellow-400"
                                : j.mood === "Sedih"
                                  ? "bg-blue-400"
                                  : j.mood === "Marah"
                                    ? "bg-red-400"
                                    : j.mood === "Cemas"
                                      ? "bg-purple-400"
                                      : "bg-slate-300"
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 shrink-0 bg-[#F8FAFD] border-t border-slate-200">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-[#444746] hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all text-sm font-semibold group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 md:px-12 shrink-0 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
              <Cloud
                className={`h-4 w-4 ${status === "Saved" ? "text-emerald-500" : "text-indigo-400 animate-pulse"}`}
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {status}
              </span>
            </div>
          </div>

          <Button
            onClick={handleAIPreview}
            disabled={isRefining || !text.trim()}
            className="bg-indigo-600 text-white rounded-full px-5 py-5 flex gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            {isRefining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="hidden md:inline font-bold text-xs uppercase tracking-tight">
              Tidy-up
            </span>
          </Button>
        </header>

        <div
          className="flex-1 overflow-y-auto px-6"
          onClick={() => document.getElementById("journal-input")?.focus()}
        >
          <div className="max-w-3xl mx-auto pt-16 md:pt-24 pb-40">
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-4 text-indigo-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                <PenLine className="h-3 w-3" /> Digital Journal
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F1F1F] tracking-tight leading-tight mb-6">
                {journalId ? "Edit ceritamu." : "Mau cerita apa hari ini?"}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-slate-400 text-sm font-medium italic">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <span className="text-slate-200 hidden md:inline">|</span>

                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 transition-all"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${category === "Work" ? "bg-blue-400" : category === "Ideas" ? "bg-amber-400" : category === "Urgent" ? "bg-red-400" : "bg-indigo-400"}`}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                      {category}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-slate-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isCategoryOpen && (
                    <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-slate-100 shadow-xl rounded-2xl p-1.5 z-20 overflow-hidden">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors ${category === cat ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                    mood === "Senang"
                      ? "bg-yellow-100 text-yellow-700"
                      : mood === "Sedih"
                        ? "bg-blue-100 text-blue-700"
                        : mood === "Marah"
                          ? "bg-red-100 text-red-700"
                          : mood === "Cemas"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isAnalyzingMood ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Smile className="h-3.5 w-3.5" />
                  )}
                  {isAnalyzingMood ? "Analyzing..." : `Mood: ${mood}`}
                </div>
              </div>
            </div>

            <Textarea
              id="journal-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ketik ceritamu di sini..."
              className="w-full border-none focus-visible:ring-0 text-xl md:text-2xl p-0 bg-transparent resize-none min-h-[500px] leading-[1.8] text-[#1F1F1F] placeholder:text-[#C4C7C5] font-medium"
            />
          </div>
        </div>

        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900 uppercase">
                  AI Tidy-up Preview
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowComparison(false)}
                  className="rounded-full h-12 w-12"
                >
                  <X />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <span className="px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">
                    Asli
                  </span>
                  <div className="text-slate-500 leading-relaxed italic text-lg">
                    {text}
                  </div>
                </div>
                <div className="space-y-4 bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100">
                  <span className="px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase">
                    Refined
                  </span>
                  <div className="text-indigo-950 leading-relaxed font-semibold text-lg">
                    {refinedText}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t flex gap-4">
                <Button
                  onClick={applyRefinement}
                  className="flex-1 py-8 bg-indigo-600 text-white rounded-[1.25rem] font-black text-lg"
                >
                  Gunakan Hasil AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(false)}
                  className="flex-1 py-8 rounded-[1.25rem] font-bold text-lg border-2"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-slate-100 px-8 py-3 rounded-full flex items-center gap-6 shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Words
            </span>
            <span className="text-sm font-bold text-slate-700">
              {text.trim() ? text.trim().split(/\s+/).length : 0}
            </span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Status
            </span>
            <Check className="h-4 w-4 text-emerald-500 mt-0.5" />
          </div>
        </div>
      </main>
    </div>
  );
}
