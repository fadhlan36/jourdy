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
            model: "llama-3.1-8b-instant",
            max_tokens: 1024,
            messages: [{
                role: "user",
                content: `Kamu adalah asisten jurnal. Rapikan tulisan ini agar lebih mengalir dan reflektif dalam Bahasa Indonesia tanpa mengubah maknanya. Langsung berikan hasil revisinya saja tanpa komentar/tanda kutip: "${content}"`
            }]
        });

        const refinedText = completion.choices[0].message.content ?? content;
        return NextResponse.json({ refinedText });
    } catch (error: any) {
        console.error("Tidy-up Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}