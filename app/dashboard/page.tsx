"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { BackgroundEmojis } from "@/components/dashboard/BackgroundEmojis";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Editor } from "@/components/dashboard/Editor";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { ComparisonModal } from "@/components/dashboard/ComparisonModal";

export default function DashboardPage() {
  // --- STATE MANAGEMENT ---
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
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- STATE AI & INSIGHTS ---
  const [calendarKey, setCalendarKey] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [refinedText, setRefinedText] = useState("");
  const [mood, setMood] = useState("Netral");
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState<any>(null);

  // --- REFS ---
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentMood = useRef(mood);
  const journalIdRef = useRef<string | null>(null);
  const categoryRef = useRef(category);
  const analyzingRef = useRef(false);
  const requestIdRef = useRef(0);
  // Konten terakhir yang sudah dianalisis moodnya, per jurnal
  const lastAnalyzedRef = useRef<{ id: string | null; content: string }>({
    id: null,
    content: "",
  });

  useEffect(() => {
    currentMood.current = mood;
  }, [mood]);
  useEffect(() => {
    journalIdRef.current = journalId;
  }, [journalId]);
  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  // Sidebar responsif
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ringkasan mingguan
  const fetchWeeklyInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const res = await fetch("/api/ai/weekly-insight", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.insight) setWeeklyInsight(data.insight);
    } catch (err) {
      console.error("Weekly Insight Error:", err);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  // Deteksi mood
  // force = true: selalu jalan (dipakai saat jurnal diklik di sidebar)
  const handleMoodDetection = async (
    content: string,
    id: string,
    force = false,
  ) => {
    if (content.trim().length < 15) return;

    // Deteksi dari auto-save tetap hemat: lewati kalau sedang jalan
    // atau konten tidak berubah sejak analisis terakhir
    if (!force) {
      if (analyzingRef.current) return;
      const last = lastAnalyzedRef.current;
      if (last.id === id && last.content === content) return;
    }

    const requestId = ++requestIdRef.current;
    analyzingRef.current = true;
    setIsAnalyzingMood(true);
    try {
      const aiRes = await fetch("/api/ai/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const aiData = await aiRes.json();
      const detectedMood = aiData.mood || "Netral";

      await fetch(`/api/journal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          category: categoryRef.current,
          mood: detectedMood,
        }),
      });

      lastAnalyzedRef.current = { id, content };

      // Update mood di editor hanya kalau jurnal aktif masih yang sama
      if (journalIdRef.current === id) {
        setMood(detectedMood);
        currentMood.current = detectedMood;
      }
      setJournals((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, mood: detectedMood, content } : j,
        ),
      );
      setCalendarKey((p) => p + 1);
    } catch (err) {
      console.error("Mood Update Error:", err);
    } finally {
      // Hanya request terbaru yang boleh mematikan indikator loading
      if (requestId === requestIdRef.current) {
        analyzingRef.current = false;
        setIsAnalyzingMood(false);
      }
    }
  };

  // --- AUTO-SAVE ---
  useEffect(() => {
    if (!text.trim()) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setStatus("Saving...");

    const contentToSave = text;
    const categoryToSave = category;

    saveTimeoutRef.current = setTimeout(async () => {
      let activeId = journalIdRef.current;

      try {
        if (!activeId) {
          const res = await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: contentToSave,
              category: categoryToSave,
              mood: "Netral",
            }),
          });
          if (!res.ok) throw new Error("Gagal menyimpan jurnal baru");

          const data = await res.json();
          if (data?.id) {
            activeId = data.id;
            journalIdRef.current = data.id;
            setJournalId(data.id);
            setJournals((prev) => [data, ...prev]);
            fetchWeeklyInsight();
          }
        } else {
          const res = await fetch(`/api/journal/${activeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: contentToSave,
              category: categoryToSave,
              mood: currentMood.current,
            }),
          });
          if (!res.ok) throw new Error("Gagal mengupdate jurnal");

          setJournals((prev) =>
            prev.map((j) =>
              j.id === activeId
                ? { ...j, content: contentToSave, category: categoryToSave }
                : j,
            ),
          );
        }

        setStatus("Saved");
        setCalendarKey((p) => p + 1);

        if (activeId && contentToSave.trim().length >= 15) {
          await handleMoodDetection(contentToSave, activeId);
        }
      } catch (err) {
        console.error("Save Error:", err);
        setStatus("Error");
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // journalId sengaja tidak dimasukkan: dibaca lewat ref agar tidak simpan ganda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, category]);

  // Cek login & data awal
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUserEmail(data.user.email ?? null);
        try {
          const res = await fetch("/api/journal");
          const d = await res.json();
          setJournals(Array.isArray(d) ? d : []);
          if (Array.isArray(d) && d.length > 0) fetchWeeklyInsight();
        } catch (err) {
          console.error("Load Journals Error:", err);
        }
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [router]);

  // Kelompokkan jurnal per kategori
  const groupedJournals = useMemo(() => {
    const groups: Record<string, any[]> = {};
    journals
      .filter((j) =>
        j.content?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .forEach((j) => {
        const cat = j.category || "Personal";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(j);
      });
    return groups;
  }, [journals, searchQuery]);

  if (checkingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );

  return (
    <div className="flex h-screen bg-[#F9F9F9] text-[#212121] overflow-hidden relative font-sans">
      <BackgroundEmojis />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        groupedJournals={groupedJournals}
        collapsedCategories={collapsedCategories}
        toggleCategoryCollapse={(cat: string) =>
          setCollapsedCategories((prev) => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
          })
        }
        journalId={journalId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewEntry={() => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          setText("");
          setJournalId(null);
          journalIdRef.current = null;
          setCategory("Personal");
          setMood("Netral");
          currentMood.current = "Netral";
          lastAnalyzedRef.current = { id: null, content: "" };
          setStatus("Ready");
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onSelectJournal={(j: any) => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          setJournalId(j.id);
          journalIdRef.current = j.id;
          setText(j.content);
          setCategory(j.category || "Personal");
          setMood(j.mood || "Netral");
          currentMood.current = j.mood || "Netral";
          setStatus("Ready");
          if (window.innerWidth < 1024) setIsSidebarOpen(false);

          // Deteksi mood ulang setiap kali jurnal dibuka
          handleMoodDetection(j.content, j.id, true);
        }}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <Editor
          text={text}
          setText={setText}
          status={status}
          mood={mood}
          isAnalyzingMood={isAnalyzingMood}
          category={category}
          setCategory={setCategory}
          isCategoryOpen={isCategoryOpen}
          setIsCategoryOpen={setIsCategoryOpen}
          journalId={journalId}
          isRefining={isRefining}
          userEmail={userEmail}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onAIPreview={async () => {
            if (!text.trim() || isRefining) return;
            setIsRefining(true);
            try {
              const res = await fetch("/api/ai/tidy-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
              });
              const data = await res.json();
              if (res.ok && data.refinedText) {
                setRefinedText(data.refinedText);
                setShowComparison(true);
              }
            } catch (err) {
              console.error("Tidy-up Error:", err);
            } finally {
              setIsRefining(false);
            }
          }}
        />

        <InsightsPanel
          calendarKey={calendarKey}
          weeklyInsight={weeklyInsight}
          isLoadingInsight={isLoadingInsight}
          onRefreshInsight={fetchWeeklyInsight}
        />
      </div>

      {showComparison && (
        <ComparisonModal
          originalText={text}
          refinedText={refinedText}
          onClose={() => setShowComparison(false)}
          onApply={() => {
            // Mengubah text memicu auto-save, lalu deteksi mood jalan otomatis
            setText(refinedText);
            setShowComparison(false);
          }}
        />
      )}
    </div>
  );
}
