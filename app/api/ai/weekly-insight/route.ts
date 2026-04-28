import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            },
        }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: journals } = await supabase
            .from("journals")
            .select("content, mood, created_at")
            .eq("user_id", user.id)
            .gte("created_at", oneWeekAgo.toISOString())
            .order("created_at", { ascending: true });

        if (!journals || journals.length === 0) {
            return NextResponse.json({
                insight: {
                    emotionalState: "Belum ada catatan.",
                    patterns: "Tulis lebih banyak jurnal untuk melihat pola.",
                    recommendation: "Cobalah mulai menulis satu paragraf hari ini."
                }
            });
        }

        const journalSummary = journals
            .map(j => `[${new Date(j.created_at).toLocaleDateString('id-ID')}] Mood: ${j.mood} | Konten: ${j.content}`)
            .join("\n");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Anda adalah asisten psikologi. WAJIB menjawab HANYA dalam format JSON valid." },
                    { role: "user", content: `Analisis: ${journalSummary}. Format: {"emotionalState": "...", "patterns": "...", "recommendation": "..."}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.5,
            }),
        });

        const data = await response.json();
        const rawContent = data.choices[0].message.content;

        // Pembersihan ekstra: pastikan hanya mengambil objek JSON
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : rawContent;

        return NextResponse.json({ insight: JSON.parse(cleanJson) });
    } catch (error: any) {
        console.error("Weekly Insight Error:", error);
        return NextResponse.json({ error: "Gagal memproses insight" }, { status: 500 });
    }
}