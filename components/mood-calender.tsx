"use client";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const moodColors: { [key: string]: string } = {
  Senang: "bg-yellow-400",
  Sedih: "bg-blue-400",
  Marah: "bg-red-400",
  Cemas: "bg-purple-400",
  Netral: "bg-slate-300",
};

const moodTextColors: { [key: string]: string } = {
  Senang: "bg-yellow-400 text-yellow-900 hover:bg-yellow-500",
  Sedih: "bg-blue-400 text-white hover:bg-blue-500",
  Marah: "bg-red-400 text-white hover:bg-red-500",
  Cemas: "bg-purple-400 text-white hover:bg-purple-500",
  Netral: "bg-slate-200 text-slate-700 hover:bg-slate-300",
};

export function MoodCalendar() {
  // Data sekarang berupa { "2026-04-22": ["Senang", "Sedih"] }
  const [moodData, setMoodData] = React.useState<{ [key: string]: string[] }>(
    {},
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMoods() {
      try {
        const res = await fetch("/api/journal/mood-stats");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMoodData(data);
      } catch (err) {
        console.error("Gagal mengambil statistik mood:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMoods();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Calendar
        mode="single"
        className="rounded-3xl border shadow-sm bg-white p-4"
        components={{
          Day: ({ day, modifiers }) => {
            const date = day.date;
            const dateStr = format(date, "yyyy-MM-dd");
            const moods = moodData[dateStr] || [];
            const hasMood = moods.length > 0;

            // Kalau hanya 1 mood, pakai background penuh seperti sebelumnya
            // Kalau lebih dari 1, background putih + dot-dot di bawah
            const singleMoodClass =
              hasMood && moods.length === 1 ? moodTextColors[moods[0]] : "";

            if (modifiers.outside) {
              return <td className="h-9 w-9 p-0" aria-hidden="true" />;
            }

            return (
              <td className="p-0 relative" role="presentation">
                <div
                  className={cn(
                    "relative flex flex-col h-9 w-9 items-center justify-center rounded-xl text-sm transition-all cursor-default font-medium",
                    moods.length === 1
                      ? singleMoodClass
                      : hasMood
                        ? "bg-slate-50 text-slate-700"
                        : "hover:bg-slate-50 text-slate-400",
                    modifiers.today &&
                      !hasMood &&
                      "ring-2 ring-indigo-500 ring-offset-1",
                    modifiers.today &&
                      hasMood &&
                      moods.length === 1 &&
                      "ring-2 ring-offset-1 ring-white/50",
                  )}
                >
                  {/* Tanggal */}
                  <span className={cn(moods.length > 1 ? "-mt-1 text-xs" : "")}>
                    {date.getDate()}
                  </span>

                  {/* Dots untuk multiple mood */}
                  {moods.length > 1 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {moods.slice(0, 4).map((m) => (
                        <div
                          key={m}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            moodColors[m] || "bg-slate-300",
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Dot today indicator untuk single mood */}
                  {modifiers.today && moods.length === 1 && (
                    <div className="absolute bottom-1 h-1 w-1 bg-white rounded-full" />
                  )}
                </div>
              </td>
            );
          },
        }}
      />

      {/* Legend */}
      <div className="mt-8 grid grid-cols-3 gap-x-4 gap-y-3 w-full max-w-[300px]">
        {Object.entries(moodColors).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full shadow-sm", color)} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
