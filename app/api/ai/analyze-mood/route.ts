import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            max_tokens: 10,
            messages: [{
                role: "user",
                content: `Analisis mood dari potongan jurnal berikut.
Berikan jawaban HANYA DALAM SATU KATA dari pilihan berikut: Senang, Sedih, Marah, Cemas, Netral.
JANGAN berikan penjelasan atau tanda baca.

Teks: "${content}"`
            }]
        });

        const mood = completion.choices[0].message.content?.trim() ?? "Netral";
        return NextResponse.json({ mood });
    } catch (error: any) {
        console.error("Mood Analysis Error:", error.message);
        return NextResponse.json({ mood: "Netral" });
    }
}