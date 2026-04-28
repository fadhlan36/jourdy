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

  const [calendarKey, setCalendarKey] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [refinedText, setRefinedText] = useState("");
  const [mood, setMood] = useState("Netral");
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState<any>(null);

  const router = useRouter();
  const isSaving = useRef(false);
  const lastMoodCheck = useRef(0);
  const lastContentAnalyzed = useRef("");
  const currentCategory = useRef(category);
  const currentMood = useRef(mood);

  // Sync refs agar auto-save selalu mendapat nilai terbaru tanpa re-render berlebih
  useEffect(() => {
    currentCategory.current = category;
  }, [category]);
  useEffect(() => {
    currentMood.current = mood;
  }, [mood]);

  // Responsive Sidebar handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchWeeklyInsight = async () => {
    if (isLoadingInsight) return;
    setIsLoadingInsight(true);
    try {
      const res = await fetch("/api/ai/weekly-insight", { method: "POST" });
      const data = await res.json();
      if (data.insight) setWeeklyInsight(data.insight);
    } catch (err) {
      console.error("Fetch Insight Error:", err);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const detectMood = async (
    content: string,
    id: string | null,
    force = false,
  ) => {
    if (content.length < 15 || !id || isAnalyzingMood) return;
    const now = Date.now();

    // Throttle deteksi mood agar tidak spam API (setiap 15 detik atau jika dipaksa)
    if (
      !force &&
      (now - lastMoodCheck.current < 15000 ||
        content === lastContentAnalyzed.current)
    )
      return;

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

      // Update local state, biarkan auto-save yang melakukan sinkronisasi ke DB
      setMood(detectedMood);
      currentMood.current = detectedMood;

      setJournals((prev) =>
        prev.map((j) => (j.id === id ? { ...j, mood: detectedMood } : j)),
      );
      setCalendarKey((p) => p + 1);
    } catch (err) {
      console.error("Mood Analysis Error:", err);
    } finally {
      setIsAnalyzingMood(false);
    }
  };

  // Logic Auto-Save Utama
  useEffect(() => {
    if ((!text.trim() && !journalId) || isSaving.current) return;

    const timeout = setTimeout(async () => {
      setStatus("Saving...");
      isSaving.current = true;
      try {
        if (!journalId) {
          // POST: Create new journal
          const res = await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: text,
              category: currentCategory.current,
              mood: "Netral",
            }),
          });
          const data = await res.json();
          if (data?.id) {
            setJournalId(data.id);
            setJournals((prev) => [data, ...prev]);
            detectMood(text, data.id, true);
            fetchWeeklyInsight();
          }
        } else {
          // PUT: Update existing journal
          const payload = {
            content: text,
            category: currentCategory.current,
            mood: currentMood.current,
          };

          await fetch(`/api/journal/${journalId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          setJournals((prev) =>
            prev.map((j) => (j.id === journalId ? { ...j, ...payload } : j)),
          );

          if (text.trim().length > 15) detectMood(text, journalId);
        }
        setStatus("Saved");
        setCalendarKey((p) => p + 1);
      } catch (err) {
        console.error("Save Error:", err);
        setStatus("Error");
      } finally {
        isSaving.current = false;
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [text, category, journalId]);

  // Auth & Initial Data Fetch
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
          const arr = Array.isArray(d) ? d : [];
          setJournals(arr);
          if (arr.length > 0) fetchWeeklyInsight();
        } catch (e) {
          setJournals([]);
        }
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [router]);

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
    <div className="flex h-screen bg-[#F9F9F9] text-[#212121] font-sans overflow-hidden relative">
      <BackgroundEmojis />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
          setText("");
          setJournalId(null);
          setCategory("Personal");
          setMood("Netral");
          setStatus("Ready");
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onSelectJournal={(j: any) => {
          setJournalId(j.id);
          setText(j.content);
          setCategory(j.category || "Personal");
          setMood(j.mood || "Netral");
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
          detectMood(j.content, j.id, true);
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
                body: JSON.stringify({ content: text }),
              });
              const data = await res.json();
              if (data.refinedText) {
                setRefinedText(data.refinedText);
                setShowComparison(true);
              }
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
            setText(refinedText);
            setShowComparison(false);
            if (journalId) detectMood(refinedText, journalId, true);
          }}
        />
      )}
    </div>
  );
}
