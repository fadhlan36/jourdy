import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel(
            { model: "gemini-2.5-flash-lite" },
            { apiVersion: "v1" }
        );

        const prompt = `Analisis mood dari potongan jurnal berikut. 
    Berikan jawaban HANYA DALAM SATU KATA dari pilihan berikut: Senang, Sedih, Marah, Cemas, Netral.
    JANGAN berikan penjelasan atau tanda baca.
    
    Teks: "${content}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const mood = response.text().trim();

        return NextResponse.json({ mood });
    } catch (error: any) {
        console.error("Mood Analysis Error:", error);
        return NextResponse.json({ mood: "Netral" });
    }
}