import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: "Konten kosong" }, { status: 400 });

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: process.env.AI_MODEL_FAST ?? "openai/gpt-oss-20b",
            max_tokens: 1024,
            // Mengatur temperature ke 0 agar hasilnya kaku/konsisten mengikuti instruksi
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah asisten editor teks. Tugasmu HANYA memperbaiki typo (salah ketik) dan merapikan tanda baca atau spasi. JANGAN mengubah pilihan kata, jangan menambah kalimat, dan jangan mengubah struktur kalimat. Berikan hasilnya langsung tanpa komentar apa pun."
                },
                {
                    role: "user",
                    content: content
                }
            ]
        });

        const refinedText = completion.choices[0].message.content?.trim() ?? content;
        return NextResponse.json({ refinedText });
    } catch (error: any) {
        console.error("Tidy-up Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}