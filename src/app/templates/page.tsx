import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Trash2,
    Eye,
    Download,
} from "lucide-react";
import Link from "next/link";
import { getTemplates, deleteTemplate } from "../actions";

export default async function TemplatesPage() {
    let templates: Awaited<ReturnType<typeof getTemplates>> = [];
    try {
        templates = await getTemplates();
    } catch {
        // Supabase not configured yet
    }

    return (
        <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Saved Templates</h1>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        All your converted email templates saved in Supabase.
                    </p>
                </div>
                <Link
                    href="/migrate"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                    + New Migration
                </Link>
            </div>

            {templates.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-20 text-center">
                    <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        No templates yet
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                        Start by converting a Mailchimp template.
                    </p>
                    <Link
                        href="/migrate"
                        className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        Start Migration
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[var(--primary)]/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[var(--foreground)]">{t.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <StatusBadge status={t.status} />
                                            <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(t.created_at).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-[var(--muted)]">
                                                {t.assets?.length || 0} assets
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/templates/${t.id}`}
                                        className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                                        title="View"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteTemplate(t.id);
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config = {
        completed: { icon: CheckCircle2, color: "var(--success)", label: "Completed" },
        draft: { icon: Clock, color: "var(--warning)", label: "Draft" },
        failed: { icon: XCircle, color: "var(--danger)", label: "Failed" },
    }[status] || { icon: Clock, color: "var(--muted)", label: status };

    const Icon = config.icon;

    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
                backgroundColor: `${config.color}15`,
                color: config.color,
            }}
        >
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}
