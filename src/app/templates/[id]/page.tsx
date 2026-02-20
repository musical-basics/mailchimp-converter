import { Eye, Code, FileText, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { getTemplate } from "../../actions";
import { notFound } from "next/navigation";

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
                            Created {new Date(template.created_at).toLocaleString()} · {template.assets?.length || 0} assets
                        </p>
                    </div>
                </div>
            </div>

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
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-2">
                    <Code className="w-4 h-4 text-[var(--muted)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">HTML Source</span>
                </div>
                <pre className="p-5 text-xs text-[var(--foreground)] overflow-auto max-h-96 code-editor">
                    {template.generated_html}
                </pre>
            </div>
        </div>
    );
}
