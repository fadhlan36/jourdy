"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { BackgroundEmojis } from "@/components/dashboard/BackgroundEmojis";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Akun berhasil dibuat! Mengalihkan...");
    setIsSuccess(true);
    setLoading(false);

    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9F9] p-4 relative overflow-hidden">
      {/* Emoji Background - Same as Dashboard */}
      <BackgroundEmojis />

      {/* Background Blobs for extra depth */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-100/30 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <Card className="w-full max-w-[420px] shadow-2xl border border-slate-100 bg-white/80 backdrop-blur-xl relative z-10 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-4 text-center pt-12 px-8">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
              Mulai <span className="text-indigo-600">Jourdy</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Gratis selamanya, privat, dan aman. 🔒
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-12 px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-12 h-14 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-600 text-slate-900 font-medium border-2 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Kata Sandi Baru
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  className="pl-12 h-14 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-600 text-slate-900 font-medium border-2 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center justify-center gap-2 text-xs py-3 px-4 rounded-xl font-bold border transition-all animate-in fade-in slide-in-from-top-2 ${isSuccess ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}
              >
                {isSuccess && <CheckCircle2 className="h-4 w-4" />}
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 flex gap-2 text-base mt-2"
              disabled={loading || isSuccess}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Daftar Akun Gratis <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-slate-500 font-bold hover:text-indigo-600 flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Sudah punya akun? Masuk
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
