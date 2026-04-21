import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PUT - update journal by id
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Ubah tipe jadi Promise
) {
    const body = await req.json();
    const { id } = await params; // Await params di sini

    const { error } = await supabase
        .from("journals")
        .update({ content: body.content })
        .eq("id", id); // Gunakan id yang sudah di-await

    if (error) {
        console.log("Update Error:", error);
        return NextResponse.json({ error: "Gagal update" }, { status: 400 });
    }

    return NextResponse.json({ message: "Berhasil update" });
}