import {
  Zap,
  ImageIcon,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { getTemplates } from "./actions";

export default async function DashboardPage() {
  let templates: Awaited<ReturnType<typeof getTemplates>> = [];
  try {
    templates = await getTemplates();
  } catch {
    // Supabase not configured yet, graceful fallback
  }

  const completed = templates.filter((t) => t.status === "completed").length;
  const totalImages = templates.reduce((sum, t) => sum + (t.assets?.length || 0), 0);

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard Overview</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Manage your email template migrations and view system status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Total Migrations"
          value={templates.length.toString()}
          color="var(--primary)"
        />
        <StatCard
          icon={<ImageIcon className="w-5 h-5" />}
          label="Images Processed"
          value={totalImages.toString()}
          color="var(--accent)"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Success Rate"
          value={templates.length > 0 ? `${Math.round((completed / templates.length) * 100)}%` : "—"}
          color="var(--success)"
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Start New Migration */}
        <Link
          href="/migrate"
          className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--primary)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Start New Migration
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Import a template from Mailchimp or upload raw HTML to begin the AI-powered
              conversion process.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--primary)]">
              Begin migration
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Image Library */}
        <Link
          href="/library"
          className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 hover:border-[var(--accent)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-12 h-12 mb-4 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Image Library
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Browse and manage uploaded images. Map assets to template slots for precise
              placement.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
              View library
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Migrations Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--foreground)]">Recent Migrations</h3>
          <Link
            href="/templates"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        {templates.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Zap className="w-8 h-8 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-sm text-[var(--muted)]">
              No migrations yet. Start by uploading a Mailchimp template.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="text-left px-6 py-3 font-medium">Template</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Assets</th>
                <th className="text-left px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {templates.slice(0, 8).map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  onClick={undefined}
                >
                  <td className="px-6 py-3 text-sm font-medium text-[var(--foreground)]">
                    <Link href={`/templates/${t.id}`} className="hover:text-[var(--primary)] transition-colors">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/templates/${t.id}`}>
                      <StatusBadge status={t.status} />
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-[var(--muted)]">
                    <Link href={`/templates/${t.id}`}>
                      {t.assets?.length || 0} files
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-[var(--muted)]">
                    <Link href={`/templates/${t.id}`} className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(t.created_at).toLocaleDateString()}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
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
