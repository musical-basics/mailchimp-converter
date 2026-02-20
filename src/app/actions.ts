"use server";

import { getSupabaseClient, MailchimpTemplate } from "@/lib/supabase";
import { convertMailchimpToEmail } from "@/lib/ai/email-generator";
import { parseMailchimpHtml, generateContentSummary } from "@/lib/parsers/mailchimp-parser";
import { revalidatePath } from "next/cache";

// ─── Template CRUD ────────────────────────────────────────

export async function getTemplates(): Promise<MailchimpTemplate[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("mailchimp_templates")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getTemplates error:", error.message);
        return [];
    }
    return data ?? [];
}

export async function getTemplate(id: string): Promise<MailchimpTemplate | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("mailchimp_templates")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function saveTemplate(template: {
    name: string;
    source_html: string;
    generated_html: string;
    assets: { filename: string; url: string; slot: string }[];
    status: string;
}): Promise<MailchimpTemplate | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
        console.warn("Supabase not configured, skipping save");
        return null;
    }

    const { data, error } = await supabase
        .from("mailchimp_templates")
        .insert(template)
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath("/");
    return data;
}

export async function updateTemplate(
    id: string,
    updates: Partial<MailchimpTemplate>
): Promise<MailchimpTemplate | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("mailchimp_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath("/");
    return data;
}

export async function deleteTemplate(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase
        .from("mailchimp_templates")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/");
}

// ─── Conversion Pipeline ──────────────────────────────────

export async function convertEmail(formData: FormData): Promise<{
    success: boolean;
    generatedHtml?: string;
    contentMap?: string;
    templateId?: string;
    error?: string;
}> {
    try {
        const htmlFile = formData.get("htmlFile") as File;
        const templateName = (formData.get("templateName") as string) || "Untitled Template";

        if (!htmlFile) {
            return { success: false, error: "No HTML file provided" };
        }

        const htmlContent = await htmlFile.text();

        // Get asset filenames from form data
        const assetFilenames: string[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("asset_") && value instanceof File) {
                assetFilenames.push(value.name);
            }
        }

        // Run the AI conversion pipeline
        const { generatedHtml, contentMap } = await convertMailchimpToEmail(
            htmlContent,
            assetFilenames
        );

        // Save to Supabase (gracefully skip if not configured)
        let templateId: string | undefined;
        try {
            const template = await saveTemplate({
                name: templateName,
                source_html: htmlContent,
                generated_html: generatedHtml,
                assets: assetFilenames.map((f) => ({ filename: f, url: `/api/assets/${f}`, slot: "" })),
                status: "completed",
            });
            templateId = template?.id;
        } catch (saveErr) {
            console.warn("Failed to save to Supabase:", saveErr);
        }

        return {
            success: true,
            generatedHtml,
            contentMap,
            templateId,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}

// ─── Analysis (preview without saving) ────────────────────

export async function analyzeEmail(
    htmlContent: string
): Promise<{
    title: string;
    previewText: string;
    imageCount: number;
    blockCount: number;
    linkCount: number;
    summary: string;
}> {
    const parsed = parseMailchimpHtml(htmlContent);
    const summary = generateContentSummary(parsed);

    return {
        title: parsed.title,
        previewText: parsed.previewText,
        imageCount: parsed.images.length,
        blockCount: parsed.blocks.length,
        linkCount: parsed.links.length,
        summary,
    };
}
