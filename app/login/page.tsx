"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";

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

const positions = [
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (error) {
        setMessage("Email atau password salah.");
        setLoading(false);
      } else {
        router.refresh();
        setTimeout(() => router.push("/dashboard"), 100);
      }
    } catch {
      setMessage("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden relative p-4">
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-[#C2E7FF] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-50 rounded-full blur-3xl opacity-80 pointer-events-none" />

      {/* Floating emojis */}
      {mounted &&
        floatingEmojis.map((item, i) => (
          <div
            key={i}
            className="absolute pointer-events-none select-none hidden sm:flex flex-col items-center gap-1"
            style={{
              ...positions[i],
              transform: `rotate(${item.rotate}deg)`,
              opacity: 0.18,
            }}
          >
            <span className={item.size}>{item.emoji}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {item.label}
            </span>
          </div>
        ))}

      {/* Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-[1.25rem] shadow-lg shadow-indigo-200 mb-5">
            <Sparkles className="h-7 w-7 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1F1F1F] mb-1">
            Hai, welcome back! 👋
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            lanjut cerita hari ini yuk~
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-[#F8FAFD] border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#1F1F1F] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFD] border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#1F1F1F] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>

            {message && (
              <div className="bg-red-50 text-red-500 text-xs py-3 px-4 rounded-xl border border-red-100 font-bold text-center">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 font-medium">
              belum punya akun?{" "}
              <button
                onClick={() => router.push("/register")}
                className="text-indigo-600 hover:text-indigo-700 font-black underline-offset-4 hover:underline transition-colors"
              >
                daftar gratis ✨
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300 font-medium mt-6 tracking-wide">
          jurnalmu aman & privat 🔒
        </p>
      </div>
    </div>
  );
}
