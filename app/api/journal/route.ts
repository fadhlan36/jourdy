import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET DATA KE SUPABASE
export async function GET() {
    const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json([]);

    return NextResponse.json(data);
}

// MENAMBAHKAN DATA KE SUPABASE
export async function POST(req: Request) {
    const body = await req.json();

    const { data, error } = await supabase
        .from("journals")
        .insert([{ content: body.content }])
        .select()  // 👈 supaya id dikembalikan
        .single(); // 👈 return object langsung

    if (error) {
        console.log(error);
        return NextResponse.json({ error: "Gagal simpan" });
    }

    return NextResponse.json(data); // { id, content, created_at, ... }
}