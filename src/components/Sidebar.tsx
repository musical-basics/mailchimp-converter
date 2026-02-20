"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderOpen,
    ImageIcon,
    Settings,
    Zap,
    Mail,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/migrate", label: "New Migration", icon: Zap },
    { href: "/library", label: "Image Library", icon: ImageIcon },
    { href: "/templates", label: "Templates", icon: FolderOpen },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col border-r bg-[var(--surface)] border-[var(--border)]">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)]">
                <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-[var(--foreground)]">Migration Tool</h1>
                    <span className="text-[10px] text-[var(--muted)] font-mono">v2.4.0</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                                }`}
                        >
                            <Icon className="w-4.5 h-4.5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xs font-bold text-white">
                        LY
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-[var(--foreground)]">Lionel Yu</p>
                        <p className="text-[10px] text-[var(--muted)]">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
