"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

const floatingEmojis = [
  { emoji: "😊", label: "senang", rotate: 10, size: "text-4xl" },
  { emoji: "😭", label: "nangis", rotate: -8, size: "text-3xl" },
  { emoji: "😤", label: "marah", rotate: 6, size: "text-5xl" },
  { emoji: "😰", label: "cemas", rotate: -14, size: "text-3xl" },
  { emoji: "🥺", label: "baper", rotate: 12, size: "text-4xl" },
  { emoji: "😮‍💨", label: "lega", rotate: -5, size: "text-3xl" },
  { emoji: "🌀", label: "overthinking", rotate: 8, size: "text-3xl" },
  { emoji: "✨", label: "excited", rotate: -12, size: "text-4xl" },
  { emoji: "😶‍🌫️", label: "hampa", rotate: 15, size: "text-3xl" },
  { emoji: "🥰", label: "happy", rotate: -7, size: "text-4xl" },
  { emoji: "😩", label: "lelah", rotate: 5, size: "text-5xl" },
  { emoji: "💭", label: "pikiran", rotate: -10, size: "text-3xl" },
  { emoji: "🫠", label: "meleleh", rotate: 9, size: "text-4xl" },
  { emoji: "😌", label: "tenang", rotate: -6, size: "text-3xl" },
  { emoji: "🫀", label: "hati", rotate: 14, size: "text-3xl" },
  { emoji: "🌿", label: "healing", rotate: -11, size: "text-4xl" },
];

const positions = [
  { top: "4%", left: "4%" },
  { top: "10%", left: "16%" },
  { top: "2%", left: "40%" },
  { top: "7%", right: "14%" },
  { top: "4%", right: "4%" },
  { top: "22%", left: "2%" },
  { top: "28%", right: "3%" },
  { top: "42%", left: "5%" },
  { top: "48%", right: "2%" },
  { top: "58%", left: "3%" },
  { top: "63%", right: "5%" },
  { top: "70%", left: "14%" },
  { top: "74%", right: "13%" },
  { top: "83%", left: "5%" },
  { top: "87%", right: "4%" },
  { top: "93%", left: "28%" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Isi semua data dulu ya.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }
    await supabase.auth.signOut();
    setMessage("Akun berhasil dibuat! Redirecting...");
    setIsSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white overflow-hidden relative p-4">
      {/* Background blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] bg-[#C2E7FF] rounded-full blur-3xl opacity-50 pointer-events-none" />
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-[1.25rem] shadow-lg shadow-indigo-200 mb-5">
            <Sparkles className="h-7 w-7 text-white fill-white/20" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1F1F1F] mb-1">
            Yuk, bikin akun! 🎉
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            gratis selamanya, mulai nulis sekarang~
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100">
          {/* Feature chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              "✨ AI Tidy-up",
              "🎭 Mood Tracker",
              "📅 Mood Calendar",
              "🔒 Privat",
            ].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100"
              >
                {f}
              </span>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
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
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#F8FAFD] border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#1F1F1F] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 text-xs py-3 px-4 rounded-xl border font-bold ${
                  isSuccess
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-red-50 text-red-500 border-red-100"
                }`}
              >
                {isSuccess && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isSuccess}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 text-sm font-black uppercase tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Berhasil!
                </>
              ) : (
                "Buat Akun Sekarang 🚀"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-slate-400 font-medium hover:text-indigo-600 flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> udah punya akun? masuk dulu
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300 font-medium mt-6 tracking-wide">
          jurnalmu aman & privat 🔒
        </p>
      </div>
    </div>
  );
}
