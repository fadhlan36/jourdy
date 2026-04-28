import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            max_tokens: 15,
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: "Jawab HANYA satu kata: Senang, Sedih, Marah, Cemas, atau Netral. Tanpa tanda baca."
                },
                {
                    role: "user",
                    content: content
                }
            ]
        });

        const rawMood = completion.choices[0].message.content?.trim() || "Netral";
        // Ambil kata pertama dan bersihkan karakter non-huruf
        const mood = rawMood.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");

        const allowed = ["Senang", "Sedih", "Marah", "Cemas", "Netral"];
        const finalMood = allowed.includes(mood) ? mood : "Netral";

        return NextResponse.json({ mood: finalMood });
    } catch (error: any) {
        console.error("Mood Analysis Error:", error.message);
        return NextResponse.json({ mood: "Netral" });
    }
}