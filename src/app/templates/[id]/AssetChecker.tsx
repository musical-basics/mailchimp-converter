"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";

interface AssetStatus {
    src: string;
    status: "checking" | "ok" | "broken";
    filename: string;
}

export function AssetChecker({ imageSrcs }: { imageSrcs: string[] }) {
    const [assets, setAssets] = useState<AssetStatus[]>(
        imageSrcs.map((src) => ({
            src,
            status: "checking",
            filename: src.split("/").pop() || src,
        }))
    );

    useEffect(() => {
        imageSrcs.forEach(async (src, i) => {
            try {
                // For relative URLs, check against our API
                const url = src.startsWith("http") ? src : src;
                const res = await fetch(url, { method: "HEAD" });

                setAssets((prev) => {
                    const next = [...prev];
                    next[i] = {
                        ...next[i],
                        status: res.ok ? "ok" : "broken",
                    };
                    return next;
                });
            } catch {
                setAssets((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i], status: "broken" };
                    return next;
                });
            }
        });
    }, [imageSrcs]);

    const okCount = assets.filter((a) => a.status === "ok").length;
    const brokenCount = assets.filter((a) => a.status === "broken").length;

    return (
        <div>
            {/* Summary */}
            <div className="flex items-center gap-3 mb-3 px-1">
                <span className="flex items-center gap-1 text-[10px] text-[var(--success)]">
                    <CheckCircle2 className="w-3 h-3" /> {okCount} linked
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[var(--danger)]">
                    <XCircle className="w-3 h-3" /> {brokenCount} broken
                </span>
            </div>

            {/* Individual assets */}
            {assets.map((asset, i) => (
                <div
                    key={i}
                    className={`p-2.5 rounded-lg border mb-2 ${asset.status === "ok"
                            ? "bg-[var(--success)]/5 border-[var(--success)]/20"
                            : asset.status === "broken"
                                ? "bg-[var(--danger)]/5 border-[var(--danger)]/20"
                                : "bg-[var(--background)] border-[var(--border)]"
                        }`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        {asset.status === "checking" ? (
                            <Loader2 className="w-3 h-3 text-[var(--muted)] animate-spin shrink-0" />
                        ) : asset.status === "ok" ? (
                            <CheckCircle2 className="w-3 h-3 text-[var(--success)] shrink-0" />
                        ) : (
                            <XCircle className="w-3 h-3 text-[var(--danger)] shrink-0" />
                        )}
                        <span className="text-xs font-medium text-[var(--foreground)] truncate flex-1">
                            {asset.filename}
                        </span>
                        {asset.status === "ok" && (
                            <a
                                href={asset.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--primary)]"
                            >
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] font-mono break-all pl-5">
                        {asset.src}
                    </p>
                </div>
            ))}
        </div>
    );
}
