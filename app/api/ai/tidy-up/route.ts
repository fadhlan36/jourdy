import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        if (!content) return NextResponse.json({ error: "Konten kosong" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);

        // KITA PAKAI GEMINI-PRO (Paling Stabil, Jarang Error 404)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `Kamu adalah asisten jurnal. Rapikan tulisan ini agar lebih mengalir dan reflektif dalam Bahasa Indonesia tanpa mengubah maknanya. Langsung berikan hasil revisinya saja tanpa komentar/tanda kutip: "${content}"`;

        console.log("Memproses Tidy-up menggunakan model: gemini-pro...");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ refinedText: text });
    } catch (error: any) {
        console.error("--- LOG ERROR ---");
        console.error("Pesan:", error.message);

        // Jika gemini-pro pun gagal karena masalah region
        if (error.message.includes("location is not supported")) {
            return NextResponse.json(
                { error: "Google AI belum tersedia di koneksi internetmu. Coba gunakan VPN (Singapura)." },
                { status: 500 }
            );
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}