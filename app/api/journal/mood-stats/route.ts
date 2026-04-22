import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("journals")
            .select("created_at, mood")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Kumpulkan semua mood per tanggal (array, bukan overwrite)
        const moodStats = data.reduce((acc: Record<string, string[]>, item: any) => {
            if (item.created_at && item.mood) {
                const dateKey = new Date(item.created_at).toLocaleDateString("en-CA", {
                    timeZone: "Asia/Jakarta",
                });
                if (!acc[dateKey]) acc[dateKey] = [];
                // Hindari duplikat mood yang sama di hari yang sama
                if (!acc[dateKey].includes(item.mood)) {
                    acc[dateKey].push(item.mood);
                }
            }
            return acc;
        }, {});

        return NextResponse.json(moodStats);

    } catch (error: any) {
        console.error("Mood Stats Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}