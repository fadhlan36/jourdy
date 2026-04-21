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
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (error) setMessage("Email atau password salah.");
    else router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <Card className="w-full max-w-[400px] shadow-2xl border-none bg-white/90 backdrop-blur-md relative z-10 rounded-[2.5rem]">
        <CardHeader className="space-y-4 text-center pt-10 px-8">
          <div className="flex justify-center">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <Sparkles className="h-8 w-8 text-white fill-white/20" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter text-slate-900">
              JOURDY
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Selamat datang kembali, Penulis.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-12 px-8">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
              <Input
                type="email"
                placeholder="Alamat Email"
                className="pl-12 h-13 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 text-slate-900 placeholder:text-slate-400 font-semibold opacity-100 ring-offset-0 border-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
              <Input
                type="password"
                placeholder="Kata Sandi"
                className="pl-12 h-13 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 text-slate-900 placeholder:text-slate-400 font-semibold opacity-100 ring-offset-0 border-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className="bg-red-50 text-red-600 text-[13px] py-3 px-4 rounded-xl text-center font-bold border border-red-100 animate-in fade-in zoom-in duration-200">
              {message}
            </div>
          )}

          <Button
            className="w-full h-13 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 flex gap-2 text-md"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Masuk <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-400 font-medium">
              Baru di sini?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="text-indigo-600 hover:text-indigo-700 font-bold underline-offset-4 hover:underline"
              >
                Buat Akun Gratis
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
