import { Settings, Key, Database, Cpu } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="p-8 animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
                <p className="text-sm text-[var(--muted)] mt-1">
                    Configuration for AI models and database connection.
                </p>
            </div>

            <div className="space-y-6 max-w-2xl">
                {/* AI Models */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu className="w-5 h-5 text-[var(--primary)]" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Models</h3>
                    </div>
                    <div className="space-y-4">
                        <ConfigRow
                            label="Analysis Model"
                            value="Gemini 2.5 Pro"
                            description="Analyzes Mailchimp HTML structure and creates content maps"
                        />
                        <ConfigRow
                            label="Generation Model"
                            value="Claude Sonnet 4"
                            description="Generates clean, portable HTML email code"
                        />
                    </div>
                </div>

                {/* API Keys */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Key className="w-5 h-5 text-[var(--accent)]" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">API Keys</h3>
                    </div>
                    <div className="space-y-4">
                        <ConfigRow
                            label="GEMINI_API_KEY"
                            value="••••••••••••"
                            description="Set via .env.local"
                            masked
                        />
                        <ConfigRow
                            label="ANTHROPIC_API_KEY"
                            value="••••••••••••"
                            description="Set via .env.local"
                            masked
                        />
                    </div>
                </div>

                {/* Database */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-5 h-5 text-[var(--success)]" />
                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Database</h3>
                    </div>
                    <div className="space-y-4">
                        <ConfigRow
                            label="Supabase URL"
                            value="••••••••••••"
                            description="NEXT_PUBLIC_SUPABASE_URL in .env.local"
                            masked
                        />
                        <ConfigRow
                            label="Table"
                            value="mailchimp_templates"
                            description="Stores all converted templates"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConfigRow({
    label,
    value,
    description,
    masked = false,
}: {
    label: string;
    value: string;
    description: string;
    masked?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
            <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
                <p className="text-xs text-[var(--muted)]">{description}</p>
            </div>
            <span
                className={`text-sm font-mono px-3 py-1 rounded-md bg-[var(--background)] ${masked ? "text-[var(--muted)]" : "text-[var(--accent)]"}`}
            >
                {value}
            </span>
        </div>
    );
}
