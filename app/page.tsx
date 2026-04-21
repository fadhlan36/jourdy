"use client";
import { useState, useEffect, useRef } from "react";
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
  Smile, // Icon tambahan untuk mood
} from "lucide-react";

export default function Home() {
  const [text, setText] = useState("");
  const [journals, setJournals] = useState<any[]>([]);
  const [status, setStatus] = useState("Ready");
  const [journalId, setJournalId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- STATE AI ---
  const [isRefining, setIsRefining] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [refinedText, setRefinedText] = useState("");
  const [mood, setMood] = useState("Netral");
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);

  const router = useRouter();
  const isSaving = useRef(false);

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journal");
      const data = await res.json();
      setJournals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        fetchJournals();
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [router]);

  // --- FUNGSI DETEKSI MOOD ---
  const detectMood = async (content: string) => {
    if (content.length < 15) return;
    setIsAnalyzingMood(true);
    try {
      const res = await fetch("/api/ai/analyze-mood", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.mood) setMood(data.mood);
    } catch (err) {
      console.error("Mood Error:", err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  // --- AUTO SAVE EFFECT ---
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
            body: JSON.stringify({ content: text }),
          });
          const data = await res.json();
          if (data?.id) {
            setJournalId(data.id);
            setJournals((prev) => [data, ...prev]);
            detectMood(text); // Deteksi mood setelah save pertama
          }
        } else {
          await fetch(`/api/journal/${journalId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text }),
          });
          setJournals((prev) =>
            prev.map((j) => (j.id === journalId ? { ...j, content: text } : j)),
          );
          detectMood(text); // Update mood setiap kali save (typing pause)
        }
        setStatus("Saved");
      } catch (err) {
        setStatus("Error");
      } finally {
        isSaving.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [text, journalId]);

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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const startNewEntry = () => {
    setText("");
    setJournalId(null);
    setMood("Netral");
    setStatus("Ready");
    setIsSidebarOpen(false);
  };

  if (checkingAuth) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden antialiased text-[#444746]">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#F8FAFD] border-r border-slate-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full
          ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
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

        <div className="px-5 mb-6 shrink-0">
          <Button
            onClick={startNewEntry}
            className="w-full flex items-center justify-center gap-3 py-7 bg-[#C2E7FF] hover:bg-[#B3D7EF] text-[#001D35] rounded-[1.25rem] shadow-sm transition-all border-none font-semibold text-sm"
          >
            <Plus className="h-5 w-5" />
            <span>New Entry</span>
          </Button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <p className="px-9 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 shrink-0">
            Recent Notes
          </p>
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            <div className="space-y-1.5">
              {journals.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    setJournalId(j.id);
                    setText(j.content);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex flex-col gap-1 ${
                    journalId === j.id
                      ? "bg-[#E3E3E3] text-[#1F1F1F]"
                      : "hover:bg-[#EAEBEF] text-[#444746]"
                  }`}
                >
                  <p className="line-clamp-1 font-semibold text-[13px] tracking-wide">
                    {j.content || "Empty thought"}
                  </p>
                  <p className="text-[10px] opacity-50 font-medium lowercase">
                    {new Date(j.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 shrink-0 bg-[#F8FAFD] border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-[#444746] hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all text-sm font-semibold group"
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAIPreview}
              disabled={isRefining || !text.trim()}
              className="bg-indigo-600 text-white rounded-full px-5 py-5 flex gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
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
            <div className="h-10 w-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
              JD
            </div>
          </div>
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
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F1F1F] tracking-tight leading-tight">
                {journalId ? "Edit ceritamu." : "Mau cerita apa hari ini?"}
              </h1>

              {/* --- UI MOOD INDICATOR --- */}
              <div className="flex items-center gap-3 mt-6">
                <p className="text-slate-400 text-sm font-medium italic">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <span className="text-slate-200">|</span>
                <div
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                    mood === "Senang"
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      : mood === "Sedih"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : mood === "Marah"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : mood === "Cemas"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {isAnalyzingMood ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Smile className="h-3.5 w-3.5" />
                  )}
                  {isAnalyzingMood ? "Analyzing mood..." : `Mood: ${mood}`}
                </div>
              </div>
            </div>

            <Textarea
              id="journal-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hari ini ada kejadian apa?"
              className="w-full border-none focus-visible:ring-0 text-xl md:text-2xl p-0 bg-transparent resize-none min-h-[500px] leading-[1.8] text-[#1F1F1F] placeholder:text-[#C4C7C5] font-medium"
            />
          </div>
        </div>

        {/* MODAL COMPARISON (Tetap sama) */}
        {showComparison && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900">
                  AI TIDY-UP PREVIEW
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
                  Tetap Pakai Yang Asli
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING STATS */}
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
