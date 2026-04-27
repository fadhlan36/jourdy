"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sparkles, ArrowRight, Loader2, Menu, X } from "lucide-react";

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

const moodItemsBase = [
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

// Duplikat 2x untuk logic translateX(-50%)
const moodItems = [...moodItemsBase, ...moodItemsBase];

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

const steps = [
  {
    step: "01",
    emoji: "✍️",
    title: "Tulis bebas",
    desc: "Ketik apa aja yang kamu rasain — ga perlu rapi, ga perlu panjang.",
  },
  {
    step: "02",
    emoji: "🤖",
    title: "AI bekerja",
    desc: "Mood otomatis terdeteksi & tulisan bisa dirapikan dengan 1 klik.",
  },
  {
    step: "03",
    emoji: "📅",
    title: "Lihat perjalananmu",
    desc: "Buka Mood Calendar dan lihat bagaimana perasaanmu berubah setiap hari.",
  },
];

const testimonials = [
  {
    name: "Alya R.",
    role: "Mahasiswi",
    text: "Akhirnya ada jurnal yang ngerti aku. Setiap hari nulis jadi kayak ngobrol sama teman.",
    emoji: "🥰",
  },
  {
    name: "Bima S.",
    role: "Remote Worker",
    text: "Weekly insight-nya beneran ngena. Ternyata aku lebih sering cemas di hari Senin 😅",
    emoji: "😮‍💨",
  },
  {
    name: "Cinta D.",
    role: "Guru",
    text: "Fitur AI Tidy-up keren banget. Tulisan berantakanku jadi rapi tanpa kehilangan feel-nya.",
    emoji: "✨",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    };
    checkUser();
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
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate)); }
          50% { transform: translateY(-12px) rotate(var(--rotate)); }
        }
        .emoji-float { animation: float 4s ease-in-out infinite; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover { animation-play-state: paused; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .gradient-text {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-glow {
          background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%);
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08);
        }
      `}</style>

      <div className="min-h-screen w-full bg-white overflow-x-hidden relative">
        {/* Background Blobs */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />

        {/* Floating Emojis (Desktop Only) */}
        {mounted &&
          floatingEmojis.map((item, i) => (
            <div
              key={i}
              className="fixed pointer-events-none select-none hidden lg:flex flex-col items-center gap-1 emoji-float opacity-20"
              style={
                {
                  ...positions[i],
                  "--rotate": `${item.rotate}deg`,
                  animationDelay: `${i * 0.4}s`,
                } as any
              }
            >
              <span className={item.size}>{item.emoji}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                {item.label}
              </span>
            </div>
          ))}

        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 group cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Jourdy
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                Daftar Gratis
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden p-4 bg-white border-b border-slate-100 flex flex-col gap-3 animate-in slide-in-from-top-2">
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push("/register")}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-black rounded-xl"
              >
                Daftar Gratis
              </button>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="hero-glow max-w-6xl mx-auto px-6 pt-20 md:pt-32 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8 fade-up">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered personal journal
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-8 fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Tulis perasaanmu,
            <br />
            <span className="gradient-text">biarkan AI</span> yang
            <br />
            bantu sisanya.
          </h1>

          <p
            className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Jurnal harian yang ngerti kamu — deteksi mood otomatis, rapikan
            tulisan secara cerdas, dan temukan insight dari setiap harimu.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Mulai Nulis Gratis <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* Seamless Marquee Section */}
        <section
          className="py-8 bg-slate-50/50 border-y border-slate-100 overflow-hidden"
          aria-hidden="true"
        >
          <div className="marquee-track">
            {moodItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-6 py-3 mx-4 rounded-full border text-xs font-black uppercase tracking-widest flex-shrink-0 ${item.color}`}
              >
                <span>{item.emoji}</span>
                <span>Mood: {item.mood}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              Semua yang kamu butuhkan 📓
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Fitur cerdas untuk mendukung kesehatan mentalmu setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`card-hover p-8 rounded-[2rem] border ${f.color}`}
              >
                <div className="text-4xl mb-6">{f.emoji}</div>
                <h3 className={`text-lg font-black mb-3 ${f.textColor}`}>
                  {f.title}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Mulai cerita harimu sekarang.
              </h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-md mx-auto">
                Bergabunglah dengan ribuan orang yang sudah mulai merawat
                kesehatan mental mereka dengan Jourdy.
              </p>
              <button
                onClick={() => router.push("/register")}
                className="px-10 py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all mx-auto flex items-center gap-2"
              >
                Buat Akun Gratis <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-slate-900">Jourdy</span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              © 2026 Dibuat dengan 💙 oleh Fadhlan Faidh
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
