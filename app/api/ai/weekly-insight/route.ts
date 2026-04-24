import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
    // Next.js 15 memerlukan await untuk cookies()
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ambil data 7 hari terakhir
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: journals } = await supabase
        .from("journals")
        .select("content, mood, created_at")
        .eq("user_id", user.id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: true });

    // Jika tidak ada data, kirim pesan default dalam format JSON
    if (!journals || journals.length === 0) {
        return NextResponse.json({
            insight: {
                emotionalState: "Belum ada catatan yang cukup.",
                patterns: "Tulis lebih banyak jurnal untuk melihat polanya.",
                recommendation: "Cobalah menulis satu paragraf tentang harimu hari ini."
            }
        });
    }

    const journalSummary = journals
        .map(j => `[${new Date(j.created_at).toLocaleDateString('id-ID')}] Mood: ${j.mood} | Konten: ${j.content}`)
        .join("\n");

    const prompt = `
    Analisis kumpulan jurnal mingguan saya berikut ini:
    ${journalSummary}

    Tolong berikan analisis dalam Bahasa Indonesia yang suportif.
    WAJIB memberikan respon dalam format JSON valid dengan struktur:
    {
      "emotionalState": "Singkat (max 15 kata) tentang suasana hati dominan.",
      "patterns": "1-2 kalimat tentang pola atau pemicu emosi yang terlihat.",
      "recommendation": "1 saran praktis untuk menjaga kesehatan mental minggu depan."
    }
  `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Anda adalah asisten psikologi positif yang hanya menjawab dalam format JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.6,
            }),
        });

        const data = await response.json();
        const insightContent = JSON.parse(data.choices[0].message.content);
        return NextResponse.json({ insight: insightContent });
    } catch (error) {
        console.error("Groq API Error:", error);
        return NextResponse.json({ error: "Gagal memproses AI insight" }, { status: 500 });
    }
}