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
  UserPlus,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

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
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-60 animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60" />

      <Card className="w-full max-w-[420px] shadow-2xl border-none bg-white/90 backdrop-blur-md relative z-10 rounded-[2.5rem]">
        <CardHeader className="space-y-4 text-center pt-10 px-8">
          <div className="flex justify-center">
            <div className="bg-slate-900 p-4 rounded-2xl shadow-xl shadow-slate-200">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              Daftar Akun
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Simpan jurnalmu dengan aman di cloud.
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
                placeholder="Alamat Email Baru"
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
                placeholder="Buat Kata Sandi"
                className="pl-12 h-13 bg-white border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600 text-slate-900 placeholder:text-slate-400 font-semibold opacity-100 ring-offset-0 border-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`flex items-center justify-center gap-2 text-[13px] py-3 px-4 rounded-xl font-bold border transition-all animate-in fade-in slide-in-from-top-2 ${
                isSuccess
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {isSuccess && <CheckCircle2 className="h-4 w-4" />}
              {message}
            </div>
          )}

          <Button
            className="w-full h-13 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl text-md"
            onClick={handleRegister}
            disabled={loading || isSuccess}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Buat Akun Sekarang"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm text-slate-500 font-bold hover:text-indigo-600 flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
