"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  LogOut,
  Sparkles,
  Menu,
  X,
  Cloud,
  PenLine,
  Loader2,
  Smile,
  Folder,
  ChevronDown,
  Search,
  CalendarDays,
  User,
  BrainCircuit,
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

/* ─────────────────────────────────────────
    Mood colour helpers
───────────────────────────────────────── */
const moodConfig: Record<
  string,
  { bg: string; text: string; dot: string; pill: string }
> = {
  Senang: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
    pill: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  Sedih: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Marah: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  Cemas: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-400",
    pill: "bg-purple-50 text-purple-700 border-purple-200",
  },
  Netral: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    dot: "bg-slate-300",
    pill: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

const getMoodConfig = (m: string) => moodConfig[m] ?? moodConfig["Netral"];
const categoryColor: Record<string, string> = {
  Work: "bg-blue-400",
  Ideas: "bg-amber-400",
  Urgent: "bg-red-400",
  Personal: "bg-indigo-400",
};

export default function DashboardPage() {
  const [text, setText] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [status, setStatus] = useState<
    "Ready" | "Saving..." | "Saved" | "Error"
  >("Ready");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("Personal");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categories = ["Personal", "Work", "Ideas", "Urgent"];
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // AI & Mood States
  const [isRefining, setIsRefining] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [refinedText, setRefinedText] = useState("");
  const [mood, setMood] = useState("Netral");
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  // Weekly Insight States (Object based)
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState<{
    emotionalState: string;
    patterns: string;
    recommendation: string;
  } | null>(null);

  const router = useRouter();
  const isSaving = useRef(false);
  const lastMoodCheck = useRef(0);
  const lastContentAnalyzed = useRef("");
  const currentCategory = useRef(category);
  const currentMood = useRef(mood);

  useEffect(() => {
    currentCategory.current = category;
  }, [category]);
  useEffect(() => {
    currentMood.current = mood;
  }, [mood]);

  const toggleCategoryCollapse = (catName: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      next.has(catName) ? next.delete(catName) : next.add(catName);
      return next;
    });
  };

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
    let cancelled = false;
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        router.push("/login");
      } else {
        setUserEmail(data.user.email ?? null);
        await fetchJournals();
      }
      if (!cancelled) setCheckingAuth(false);
    };
    checkUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const detectMood = async (
    content: string,
    id: string | null,
    force = false,
  ) => {
    if (content.length < 15 || !id || isAnalyzingMood) return;
    if (content === lastContentAnalyzed.current && !force) return;
    const now = Date.now();
    if (!force && now - lastMoodCheck.current < 15000) return;

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
      setMood(detectedMood);
      currentMood.current = detectedMood;

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
      console.error(err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

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
          await fetch(`/api/journal/${journalId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: text,
              category,
              mood: currentMood.current,
            }),
          });
          setJournals((prev) =>
            prev.map((j) =>
              j.id === journalId ? { ...j, content: text, category } : j,
            ),
          );
          detectMood(text, journalId);
        }
        setStatus("Saved");
      } catch {
        setStatus("Error");
      } finally {
        isSaving.current = false;
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [text, category, journalId]);

  const handleAIPreview = async () => {
    if (!text.trim() || text.length < 10 || isRefining) return;
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
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  };

  const fetchWeeklyInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const res = await fetch("/api/ai/weekly-insight");
      const data = await res.json();
      if (data.insight) {
        setWeeklyInsight(data.insight);
        setIsInsightOpen(true);
      }
    } catch (err) {
      console.error("Gagal ambil insight:", err);
    } finally {
      setIsLoadingInsight(false);
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
    setStatus("Ready");
    setIsSidebarOpen(false);
    lastContentAnalyzed.current = "";
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const mc = getMoodConfig(mood);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-screen bg-[#F9F9F9] text-[#212121] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 bg-[#eff6ff] border-r border-slate-200 flex flex-col overflow-hidden z-50`}
      >
        <div className="p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase">
              Jourdy
            </span>
          </div>
          <button
            className="md:hidden p-2 hover:bg-slate-200 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 mb-6 space-y-3">
          <button
            onClick={startNewEntry}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-2xl shadow-sm transition-all font-black text-sm uppercase tracking-wide"
          >
            <Plus size={18} /> New Entry
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-4 px-5 py-4 w-full text-slate-600 hover:bg-slate-200/50 rounded-2xl transition-all border border-transparent">
                <CalendarDays size={20} />
                <span className="text-sm font-black uppercase tracking-wide">
                  Mood Calendar
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase text-center mb-2">
                  Mood Journey
                </DialogTitle>
                <DialogDescription className="text-center text-slate-500">
                  Lihat rangkuman suasana hatimu bulan ini.
                </DialogDescription>
              </DialogHeader>
              <MoodCalendar />
            </DialogContent>
          </Dialog>

          <button
            onClick={fetchWeeklyInsight}
            disabled={isLoadingInsight}
            className="flex items-center gap-4 px-5 py-4 w-full text-slate-600 bg-indigo-50/50 hover:bg-slate-200/50 rounded-2xl transition-all border border-indigo-100/50"
          >
            {isLoadingInsight ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <BrainCircuit size={20} />
            )}
            <span className="text-sm font-black uppercase tracking-wide">
              {isLoadingInsight ? "Analyzing..." : "Weekly Insights"}
            </span>
          </button>
        </div>

        <div className="px-5 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari tulisan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200/50 border-none rounded-2xl py-3.5 pl-11 text-sm focus:ring-2 focus:ring-indigo-200 outline-none font-bold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 scrollbar-hide">
          {Object.entries(groupedJournals).map(([catName, items]) => (
            <div key={catName} className="mb-4">
              <button
                onClick={() => toggleCategoryCollapse(catName)}
                className="flex items-center gap-2 px-4 py-3 w-full text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                <Folder size={14} /> {catName}
                <ChevronDown
                  size={14}
                  className={`ml-auto transition-transform ${collapsedCategories.has(catName) ? "-rotate-90" : ""}`}
                />
              </button>
              {!collapsedCategories.has(catName) &&
                items.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setJournalId(j.id);
                      setText(j.content);
                      setCategory(j.category || "Personal");
                      setMood(j.mood || "Netral");
                      detectMood(j.content, j.id, true);
                    }}
                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center gap-4 mb-1 ${journalId === j.id ? "bg-white text-slate-900 shadow-md border border-slate-100" : "hover:bg-slate-200/60 text-slate-600"}`}
                  >
                    <div
                      className={`shrink-0 w-2.5 h-2.5 rounded-full ${getMoodConfig(j.mood).dot}`}
                    />
                    <span className="truncate text-sm font-bold tracking-tight">
                      {j.content || "Tanpa Judul"}
                    </span>
                  </button>
                ))}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="flex items-center gap-3 w-full px-5 py-4 text-slate-500 hover:text-red-500 transition-all text-xs font-black uppercase tracking-[0.2em]"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Background Emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 select-none z-0">
          <span className="absolute top-[12%] left-[8%] text-8xl rotate-12">
            😊
          </span>
          <span className="absolute top-[8%] right-[10%] text-9xl -rotate-12">
            😠
          </span>
          <span className="absolute top-[40%] left-[12%] text-7xl rotate-45">
            😔
          </span>
          <span className="absolute top-[50%] right-[5%] text-[10rem] -rotate-6">
            😰
          </span>
          <span className="absolute bottom-[20%] left-[15%] text-8xl rotate-12">
            ✨
          </span>
          <span className="absolute bottom-[8%] right-[15%] text-[11rem] -rotate-12">
            🌈
          </span>
        </div>

        <header className="h-20 flex items-center justify-between px-10 shrink-0 border-b border-slate-50 relative z-10 bg-white/70 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 hover:bg-slate-100 rounded-xl transition-all"
              >
                <Menu size={24} />
              </button>
            )}
            <div className="flex items-center gap-3 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border border-slate-100">
              {status === "Saving..." ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Cloud size={14} />
              )}{" "}
              {status}
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Signed in as
              </span>
              <span className="text-xs font-black text-slate-700 leading-none">
                {userEmail?.split("@")[0] ?? "User"}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10">
          <div className="w-full max-w-4xl mb-10">
            <div className="flex items-center gap-3 mb-4 text-slate-400 font-black text-[12px] uppercase tracking-[0.3em]">
              <div className="h-px w-8 bg-slate-200" />
              <PenLine className="h-4 w-4" />{" "}
              {journalId ? "Editing mode" : "Drafting Space"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {journalId ? "Lanjutkan ceritamu." : "Apa yang ada di pikiranmu?"}
            </h1>
          </div>

          <div className="w-full max-w-4xl relative bg-white/80 backdrop-blur-[2px] border border-slate-200 rounded-[32px] shadow-sm focus-within:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] focus-within:border-slate-300 transition-all min-h-[450px] flex flex-col">
            <div className="flex items-center gap-3 px-8 pt-7 z-30">
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.1em] ${mc.pill}`}
              >
                {isAnalyzingMood ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Smile size={14} />
                )}{" "}
                {isAnalyzingMood ? "Analyzing..." : mood}
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-slate-100 transition-all"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${categoryColor[category]}`}
                  />{" "}
                  {category} <ChevronDown size={12} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full mt-3 left-0 w-44 bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] p-2 z-[50]">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tumpahkan perasaanmu di sini..."
              className="w-full bg-transparent border-none focus-visible:ring-0 text-xl md:text-2xl p-8 pb-24 resize-none min-h-[350px] placeholder:text-slate-300 font-bold leading-[1.6] tracking-tight"
            />

            <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between pointer-events-none">
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Words
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {wordCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Chars
                  </span>
                  <span className="text-sm font-black text-slate-800">
                    {text.length}
                  </span>
                </div>
              </div>
              <div className="pointer-events-auto">
                <button
                  onClick={handleAIPreview}
                  disabled={!text.trim() || isRefining}
                  className={`px-6 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] font-black text-xs uppercase tracking-widest flex items-center gap-2 ${text ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                >
                  {isRefining ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}{" "}
                  {isRefining ? "Processing..." : "Tidy up"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI WEEKLY INSIGHT DIALOG (CARD-BASED) */}
        <Dialog open={isInsightOpen} onOpenChange={setIsInsightOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-[#F8FAFD]">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
              <BrainCircuit className="absolute top-6 right-6 opacity-20 w-16 h-16" />
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                Weekly Reflection
              </DialogTitle>
              <DialogDescription className="text-indigo-100 text-xs font-bold opacity-80 uppercase tracking-widest mt-1">
                7 Days AI Personality Analysis
              </DialogDescription>
            </div>

            <div className="p-6 space-y-4">
              {weeklyInsight ? (
                <>
                  <div className="bg-white border border-indigo-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                        <Smile size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Kondisi Emosional
                      </span>
                    </div>
                    <p className="text-slate-700 font-bold text-sm leading-relaxed italic">
                      "{weeklyInsight.emotionalState}"
                    </p>
                  </div>

                  <div className="bg-white border border-indigo-50 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <Search size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Analisis Pola
                      </span>
                    </div>
                    <p className="text-slate-700 font-bold text-sm leading-relaxed">
                      {weeklyInsight.patterns}
                    </p>
                  </div>

                  <div className="bg-indigo-900 p-6 rounded-3xl shadow-xl relative overflow-hidden group">
                    <Sparkles className="absolute -bottom-2 -right-2 opacity-20 w-12 h-12 text-white" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/10 text-white rounded-xl">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-indigo-200 tracking-widest">
                        Saran Self-Care
                      </span>
                    </div>
                    <p className="text-white font-bold text-sm leading-relaxed relative z-10">
                      {weeklyInsight.recommendation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                  <p className="text-xs font-black uppercase text-slate-400">
                    Menyusun Insight...
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setIsInsightOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
              >
                Selesai Baca
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI TIDY UP COMPARISON */}
        {showComparison && (
          <div className="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="px-10 py-7 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm tracking-[0.2em] text-indigo-600">
                      AI Tidy-Up
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                      Bandingkan draf asli dengan versi yang telah diperbaiki.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-3 hover:bg-slate-200 rounded-full transition-all text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 grid md:grid-cols-2 gap-10 max-h-[65vh] overflow-y-auto scrollbar-hide text-slate-800">
                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] block">
                    Original
                  </span>
                  <p className="text-lg italic leading-relaxed font-medium">
                    {text}
                  </p>
                </div>
                <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 space-y-4">
                  <span className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em] block">
                    Refined
                  </span>
                  <p className="text-lg font-black leading-relaxed">
                    {refinedText}
                  </p>
                </div>
              </div>
              <div className="px-10 py-8 bg-slate-50 border-t flex gap-4">
                <button
                  onClick={applyRefinement}
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Pakai Versi AI
                </button>
                <button
                  onClick={() => setShowComparison(false)}
                  className="px-10 py-5 bg-white border border-slate-200 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
