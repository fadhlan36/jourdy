import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id } = await params;

        const { data, error } = await supabase
            .from("journals")
            .update({ content: body.content })
            .eq("id", id)
            .eq("user_id", user.id)
            .select().single();

        if (error) throw error;
        return NextResponse.json({ message: "Berhasil update", data });
    } catch (err: any) {
        return NextResponse.json({ error: "Gagal update" }, { status: 400 });
    }
}