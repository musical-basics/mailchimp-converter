import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
    if (!supabaseUrl || !supabaseKey) {
        return null;
    }
    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseKey);
    }
    return _supabase;
}

// For backward compatibility
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : (null as unknown as SupabaseClient);

export interface MailchimpTemplate {
    id: string;
    name: string;
    source_html: string;
    generated_html: string;
    assets: { filename: string; url: string; slot: string }[];
    status: "draft" | "completed" | "failed";
    created_at: string;
    updated_at: string;
}
