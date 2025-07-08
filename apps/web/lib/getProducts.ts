import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducts() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}
