import { Eye, Code, ArrowLeft, ImageIcon, ExternalLink, CheckCircle2, XCircle, Link2 } from "lucide-react";
import Link from "next/link";
import { getTemplate } from "../../actions";
import { notFound } from "next/navigation";
import { AssetChecker } from "./AssetChecker";

export default async function TemplateDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const template = await getTemplate(id);

    if (!template) {
        notFound();
    }

    // Extract all image src URLs from the generated HTML
    const imgSrcRegex = /< *img[^>]+src=["']([^"']+)["']/gi;
    const imageSrcs: string[] = [];
    let match;
    while ((match = imgSrcRegex.exec(template.generated_html || "")) !== null) {
        imageSrcs.push(match[1]);
    }

    // Deduplicate
    const uniqueImageSrcs = [...new Set(imageSrcs)];

    // Get stored assets from the template record
    const storedAssets = template.assets || [];

    return (
        <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/templates"
                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--foreground)]">{template.name}</h1>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                            Created {new Date(template.created_at).toLocaleString()} · {storedAssets.length} assets stored
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: Preview + Code (2 cols) */}
                <div className="col-span-2 space-y-6">
                    {/* Preview */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[var(--muted)]" />
                            <span className="text-sm font-medium text-[var(--foreground)]">Generated Email Preview</span>
                        </div>
                        <div className="bg-white">
                            <iframe
                                srcDoc={template.generated_html}
                                className="w-full min-h-[700px] border-0"
                                title="Email Preview"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>

                    {/* Code */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <Code className="w-4 h-4 text-[var(--muted)]" />
                            <span className="text-sm font-medium text-[var(--foreground)]">HTML Source</span>
                        </div>
                        <pre className="p-5 text-xs text-[var(--foreground)] overflow-auto max-h-96 code-editor">
                            {template.generated_html}
                        </pre>
                    </div>
                </div>

                {/* Right: Asset Loader Panel (1 col) */}
                <div className="space-y-4">
                    {/* Image URLs found in HTML */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-[var(--primary)]" />
                            <span className="text-sm font-semibold text-[var(--foreground)]">
                                Image URLs in HTML ({uniqueImageSrcs.length})
                            </span>
                        </div>
                        <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                            {uniqueImageSrcs.length === 0 ? (
                                <p className="text-xs text-[var(--muted)] text-center py-4">
                                    No image URLs found in the generated HTML.
                                </p>
                            ) : (
                                <AssetChecker imageSrcs={uniqueImageSrcs} />
                            )}
                        </div>
                    </div>

                    {/* Stored Assets from Supabase */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                            <span className="text-sm font-semibold text-[var(--foreground)]">
                                Stored Assets ({storedAssets.length})
                            </span>
                        </div>
                        <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                            {storedAssets.length === 0 ? (
                                <p className="text-xs text-[var(--muted)] text-center py-4">
                                    No assets stored with this template.
                                </p>
                            ) : (
                                storedAssets.map((asset: { filename: string; url: string; slot: string }, i: number) => (
                                    <div
                                        key={i}
                                        className="p-2.5 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <ImageIcon className="w-3 h-3 text-[var(--accent)] shrink-0" />
                                            <span className="text-xs font-medium text-[var(--foreground)] truncate">
                                                {asset.filename}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[var(--muted)] font-mono break-all pl-5">
                                            {asset.url}
                                        </p>
                                        {asset.slot && (
                                            <p className="text-[10px] text-[var(--accent)] pl-5 mt-0.5">
                                                Slot: {asset.slot}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <h4 className="text-xs font-semibold text-[var(--foreground)] mb-2">Debug Info</h4>
                        <div className="space-y-1.5 text-[10px] text-[var(--muted)] font-mono">
                            <p>Template ID: {template.id}</p>
                            <p>Status: {template.status}</p>
                            <p>Image refs in HTML: {uniqueImageSrcs.length}</p>
                            <p>Assets in DB: {storedAssets.length}</p>
                            <p>Created: {template.created_at}</p>
                            <p>Updated: {template.updated_at}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
