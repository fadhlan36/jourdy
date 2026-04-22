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
            temperature: 0, // Agar jawaban tidak berubah-ubah
            messages: [{
                role: "system",
                content: "Kamu adalah asisten analisis mood. Jawab HANYA dengan satu kata: Senang, Sedih, Marah, Cemas, atau Netral. Tanpa tanda baca, tanpa penjelasan."
            }, {
                role: "user",
                content: `Analisis teks ini: "${content}"`
            }]
        });

        // Bersihkan hasil: hapus titik, spasi, atau karakter non-huruf
        let rawMood = completion.choices[0].message.content?.trim() || "Netral";
        let mood = rawMood.replace(/[^a-zA-Z]/g, "");

        // Validasi kata yang diperbolehkan
        const allowed = ["Senang", "Sedih", "Marah", "Cemas", "Netral"];
        const finalMood = allowed.includes(mood) ? mood : "Netral";

        return NextResponse.json({ mood: finalMood });
    } catch (error: any) {
        console.error("Mood Analysis Error:", error.message);
        return NextResponse.json({ mood: "Netral" });
    }
}