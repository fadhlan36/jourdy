"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

const floatingEmojis = [
  { emoji: "😊", label: "senang", rotate: -12, size: "text-4xl" },
  { emoji: "😭", label: "nangis", rotate: 8, size: "text-3xl" },
  { emoji: "😤", label: "marah", rotate: -6, size: "text-5xl" },
  { emoji: "😰", label: "cemas", rotate: 14, size: "text-3xl" },
  { emoji: "🥺", label: "baper", rotate: -10, size: "text-4xl" },
  { emoji: "😮‍💨", label: "lega", rotate: 5, size: "text-3xl" },
  { emoji: "🌀", label: "overthinking", rotate: -8, size: "text-3xl" },
  { emoji: "✨", label: "excited", rotate: 12, size: "text-4xl" },
  { emoji: "😶‍🌫️", label: "hampa", rotate: -15, size: "text-3xl" },
  { emoji: "🥰", label: "happy", rotate: 7, size: "text-4xl" },
  { emoji: "😩", label: "lelah", rotate: -5, size: "text-5xl" },
  { emoji: "💭", label: "pikiran", rotate: 10, size: "text-3xl" },
  { emoji: "🫠", label: "meleleh", rotate: -9, size: "text-4xl" },
  { emoji: "😌", label: "tenang", rotate: 6, size: "text-3xl" },
  { emoji: "🫀", label: "hati", rotate: -14, size: "text-3xl" },
  { emoji: "🌿", label: "healing", rotate: 11, size: "text-4xl" },
];

// Pastikan positions.length === floatingEmojis.length agar tidak ada index out-of-bounds
const positions: React.CSSProperties[] = [
  { top: "5%", left: "3%" },
  { top: "12%", left: "18%" },
  { top: "3%", left: "38%" },
  { top: "8%", right: "15%" },
  { top: "5%", right: "3%" },
  { top: "25%", left: "2%" },
  { top: "30%", right: "4%" },
  { top: "45%", left: "6%" },
  { top: "50%", right: "2%" },
  { top: "60%", left: "2%" },
  { top: "65%", right: "6%" },
  { top: "72%", left: "15%" },
  { top: "75%", right: "14%" },
  { top: "85%", left: "4%" },
  { top: "88%", right: "3%" },
  { top: "92%", left: "30%" },
];

const moodItems = [
  {
    emoji: "😊",
    mood: "Senang",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    emoji: "😭",
    mood: "Sedih",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    emoji: "😤",
    mood: "Marah",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    emoji: "😰",
    mood: "Cemas",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    emoji: "😌",
    mood: "Netral",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    emoji: "🥰",
    mood: "Senang",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    emoji: "🥺",
    mood: "Sedih",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    emoji: "😮‍💨",
    mood: "Netral",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  // Duplikat untuk seamless loop marquee
  {
    emoji: "😊",
    mood: "Senang",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    emoji: "😭",
    mood: "Sedih",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    emoji: "😤",
    mood: "Marah",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    emoji: "😰",
    mood: "Cemas",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  {
    emoji: "😌",
    mood: "Netral",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  {
    emoji: "🥰",
    mood: "Senang",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    emoji: "🥺",
    mood: "Sedih",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    emoji: "😮‍💨",
    mood: "Netral",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
];

const features = [
  {
    emoji: "✨",
    title: "AI Tidy-up",
    desc: "Rapikan typo & tulisanmu tanpa mengubah makna sedikitpun",
    color: "bg-indigo-50 border-indigo-100",
    textColor: "text-indigo-600",
  },
  {
    emoji: "🎭",
    title: "Mood Tracker",
    desc: "AI otomatis deteksi suasana hatimu setiap kali nulis",
    color: "bg-yellow-50 border-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    emoji: "📅",
    title: "Mood Calendar",
    desc: "Lihat perjalanan mood harianmu dalam kalender warna-warni",
    color: "bg-blue-50 border-blue-100",
    textColor: "text-blue-600",
  },
  {
    emoji: "🗂️",
    title: "Kategori",
    desc: "Organisir jurnalmu ke dalam Personal, Work, Ideas & Urgent",
    color: "bg-emerald-50 border-emerald-100",
    textColor: "text-emerald-600",
  },
  {
    emoji: "☁️",
    title: "Auto-save",
    desc: "Tulisanmu tersimpan otomatis, ga perlu khawatir kehilangan",
    color: "bg-purple-50 border-purple-100",
    textColor: "text-purple-600",
  },
  {
    emoji: "🔒",
    title: "Privat & Aman",
    desc: "Jurnalmu hanya bisa diakses oleh kamu sendiri",
    color: "bg-rose-50 border-rose-100",
    textColor: "text-rose-600",
  },
];

export default function LandingPage() {
  const router = useRouter();

  /**
   * `mounted` digunakan untuk mencegah hydration mismatch pada elemen
   * yang hanya dirender di client (floating emojis dengan posisi fixed).
   */
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);

    // FIX: Gunakan flag `cancelled` untuk mencegah state update
    // pada komponen yang sudah unmount (misal: navigasi cepat).
    let cancelled = false;

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <>
      {/* FIX: Animasi floating & marquee didefinisikan via <style> tag
          karena Tailwind tidak support custom keyframes tanpa config. */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
          50%       { transform: translateY(-10px) rotate(var(--rotate)); }
        }
        .emoji-float {
          animation: float 4s ease-in-out infinite;
        }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="min-h-screen w-full bg-white overflow-x-hidden relative">
        {/* Background blobs */}
        <div className="fixed top-[-80px] left-[-80px] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-[#C2E7FF] rounded-full blur-3xl opacity-40 pointer-events-none" />

        {/* Floating emojis — hanya render setelah mounted (client-only) */}
        {mounted &&
          floatingEmojis.map((item, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="fixed pointer-events-none select-none hidden lg:flex flex-col items-center gap-1 emoji-float"
              style={
                {
                  // FIX: opacity dinaikkan ke 0.28 agar lebih terlihat
                  // FIX: --rotate dipass sebagai CSS var agar keyframe bisa pakai
                  ...positions[i],
                  opacity: 0.28,
                  "--rotate": `${item.rotate}deg`,
                  animationDelay: `${(i * 0.4) % 4}s`,
                } as React.CSSProperties
              }
            >
              <span className={item.size}>{item.emoji}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {item.label}
              </span>
            </div>
          ))}

        {/* ── NAVBAR ────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                <Sparkles className="h-4 w-4 text-white fill-white/20" />
              </div>
              <span className="text-lg font-black tracking-tight text-[#1F1F1F]">
                Jourdy
              </span>
            </div>

            {/* Buttons Section */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button
                type="button"
                aria-label="Masuk ke akun"
                onClick={() => router.push("/login")}
                className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </button>
              <button
                type="button"
                aria-label="Daftar akun gratis"
                onClick={() => router.push("/register")}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-indigo-100 active:scale-95 transition-all whitespace-nowrap"
              >
                <span className="hidden xs:inline">Daftar Gratis</span>
                <span className="xs:hidden">Daftar</span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest mb-8">
            <Sparkles className="h-3 w-3" /> AI-powered journal
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1F1F1F] leading-[1.05] mb-6">
            Tulis perasaanmu,
            <br />
            <span className="text-indigo-600">biarkan AI</span> yang
            <br />
            bantu sisanya.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Jurnal harian yang ngerti kamu — deteksi mood otomatis, rapikan
            tulisan, dan simpan semua cerita harianmu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              aria-label="Mulai nulis jurnal gratis"
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-base"
            >
              Mulai Nulis Gratis <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Masuk ke akun yang sudah ada"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-2xl border border-slate-200 active:scale-95 transition-all text-base"
            >
              Sudah punya akun
            </button>
          </div>

          <p className="text-slate-300 text-xs font-medium mt-5 tracking-wide">
            gratis selamanya · tanpa kartu kredit · privat & aman 🔒
          </p>
        </section>

        {/* ── MOOD PREVIEW STRIP (marquee) ──────────────────── */}
        {/* FIX: ganti animate-none → marquee CSS animation yang seamless */}
        <section
          className="py-8 bg-slate-50 border-y border-slate-100 overflow-hidden"
          aria-hidden="true"
        >
          <div className="marquee-track">
            {moodItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-4 py-2 mx-2 rounded-full border text-xs font-black uppercase tracking-widest flex-shrink-0 ${item.color}`}
              >
                <span>{item.emoji}</span>
                <span>Mood: {item.mood}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-24 relative z-10">
          <div className="text-center mb-14">
            <p className="text-indigo-500 font-black text-[11px] uppercase tracking-[0.3em] mb-3">
              Fitur
            </p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1F1F1F]">
              Semua yang kamu butuhkan
              <br />
              untuk nulis jurnal 📓
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className={`p-6 rounded-[1.5rem] border ${f.color} transition-all hover:scale-[1.02] hover:shadow-lg`}
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {f.emoji}
                </div>
                <h3
                  className={`text-sm font-black uppercase tracking-tight mb-1.5 ${f.textColor}`}
                >
                  {f.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section className="bg-slate-50 border-y border-slate-100 py-24 relative z-10">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-indigo-500 font-black text-[11px] uppercase tracking-[0.3em] mb-3">
                Cara Kerja
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1F1F1F]">
                Semudah nulis di notes hp 📱
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  emoji: "✍️",
                  title: "Tulis bebas",
                  desc: "Ketik apa aja yang kamu rasain hari ini — ga perlu rapi, ga perlu panjang.",
                },
                {
                  step: "02",
                  emoji: "🤖",
                  title: "AI bekerja",
                  desc: "Mood kamu otomatis terdeteksi & tulisan bisa dirapikan dengan 1 klik.",
                },
                {
                  step: "03",
                  emoji: "📅",
                  title: "Lihat perjalananmu",
                  desc: "Buka Mood Calendar dan lihat bagaimana perasaanmu berubah setiap hari.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-black text-slate-300 tracking-widest">
                      {item.step}
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="text-4xl mb-4" aria-hidden="true">
                    {item.emoji}
                  </div>
                  <h3 className="text-base font-black text-[#1F1F1F] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center relative z-10">
          <div className="bg-indigo-600 rounded-[2.5rem] p-12 md:p-16 shadow-2xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <p className="text-indigo-200 text-4xl mb-4" aria-hidden="true">
                📓
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                Mulai cerita harimu
                <br />
                sekarang, yuk!
              </h2>
              <p className="text-indigo-200 font-medium mb-8 max-w-md mx-auto">
                Gratis selamanya. Tidak butuh kartu kredit. Mulai dalam 30
                detik.
              </p>
              <button
                type="button"
                aria-label="Buat akun Jourdy gratis"
                onClick={() => router.push("/register")}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-indigo-600 font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2 mx-auto text-base"
              >
                Buat Akun Gratis <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 py-8 relative z-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white fill-white/20" />
              </div>
              <span className="text-sm font-black text-[#1F1F1F]">Jourdy</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              dibuat dengan 💙 untuk semua yang suka nulis
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
