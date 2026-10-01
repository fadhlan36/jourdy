import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const ALLOWED = ["Senang", "Sedih", "Marah", "Cemas", "Netral"];

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }
        if (!content || typeof content !== "string") {
            return NextResponse.json({ mood: "Netral" });
        }

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: process.env.AI_MODEL_FAST ?? "openai/gpt-oss-20b",
            // gpt-oss adalah model reasoning: token berpikir ikut terhitung,
            // jadi batasnya harus longgar agar jawaban tidak kosong
            max_tokens: 500,
            temperature: 0,
            reasoning_effort: "low",
            messages: [
                {
                    role: "system",
                    content:
                        "Klasifikasikan emosi dominan dari teks jurnal. Jawab HANYA satu kata dari daftar ini: Senang, Sedih, Marah, Cemas, Netral. Tanpa tanda baca, tanpa penjelasan.",
                },
                { role: "user", content },
            ],
        });

        const rawMood = completion.choices[0]?.message?.content?.trim() ?? "";
        console.log("Mood raw:", JSON.stringify(rawMood)); // hapus kalau sudah stabil

        const finalMood =
            ALLOWED.find((m) => rawMood.toLowerCase().includes(m.toLowerCase())) ?? "Netral";

        return NextResponse.json({ mood: finalMood });
    } catch (error: any) {
        console.error("Mood Analysis Error:", error?.message ?? error);
        return NextResponse.json({ mood: "Netral" });
    }
}