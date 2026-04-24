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
            messages: [
                {
                    role: "system",
                    content: `Kamu adalah editor teks yang sangat ketat. 
Tugasmu HANYA memperbaiki:
- Typo (salah ketik)
- Spasi yang kurang atau berlebih
- Huruf kapital di awal kalimat
- Tanda baca yang jelas salah (misalnya koma ganda, titik berulang)

DILARANG KERAS:
- Mengubah pilihan kata apapun
- Menambah atau menghapus kata
- Mengubah struktur kalimat
- Mengubah gaya penulisan
- Membuat kalimat "lebih baik" atau "lebih mengalir"

Kembalikan HANYA teks yang sudah diperbaiki, tanpa komentar, tanpa penjelasan, tanpa tanda kutip.`
                },
                {
                    role: "user",
                    content
                }
            ]
        });

        const refinedText = completion.choices[0].message.content ?? content;
        return NextResponse.json({ refinedText });
    } catch (error: any) {
        console.error("Tidy-up Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}