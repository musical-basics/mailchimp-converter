"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, X, ImageIcon, Save, Loader2, CheckCircle2, Trash2 } from "lucide-react";

interface AssetImage {
    name: string;
    path: string;
}

interface StagedFile {
    file: File;
    previewUrl: string;
}

export default function LibraryPage() {
    const [images, setImages] = useState<AssetImage[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<{ count: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await fetch("/api/assets");
            const data = await res.json();
            setImages(data.images || []);
        } catch {
            console.error("Failed to fetch images");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newStaged = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setStagedFiles((prev) => [...prev, ...newStaged]);
        setSaveResult(null);
        // Reset input so the same file can be re-selected
        e.target.value = "";
    };

    const removeStagedFile = (index: number) => {
        setStagedFiles((prev) => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSave = async () => {
        if (stagedFiles.length === 0) return;
        setIsSaving(true);
        setSaveResult(null);

        try {
            const formData = new FormData();
            stagedFiles.forEach((sf, i) => {
                formData.append(`file_${i}`, sf.file);
            });

            const res = await fetch("/api/assets", { method: "POST", body: formData });
            const data = await res.json();

            if (data.success) {
                setSaveResult({ count: data.count });
                // Clean up blob URLs
                stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
                setStagedFiles([]);
                // Refresh the library
                await fetchImages();
            }
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredImages = images.filter((img) =>
        img.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Image Library</h1>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        Browse and manage uploaded images for your email templates.
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Upload New
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Save Result Banner */}
            {saveResult && (
                <div className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                    <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                    <p className="text-sm text-[var(--success)] font-medium">
                        {saveResult.count} image{saveResult.count !== 1 ? "s" : ""} saved to library!
                    </p>
                    <button onClick={() => setSaveResult(null)} className="ml-auto text-[var(--success)]">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Staged Uploads Section */}
            {stagedFiles.length > 0 && (
                <div className="mb-6 rounded-xl border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-[var(--primary)]" />
                            <h3 className="text-sm font-semibold text-[var(--foreground)]">
                                Staged for Upload ({stagedFiles.length})
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
                                    setStagedFiles([]);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear All
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--success)] text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition-all"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save {stagedFiles.length} Image{stagedFiles.length !== 1 ? "s" : ""}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3">
                        {stagedFiles.map((sf, i) => (
                            <div
                                key={i}
                                className="relative group rounded-lg border border-[var(--primary)]/30 bg-[var(--surface)] overflow-hidden"
                            >
                                <div className="aspect-video bg-[var(--background)] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={sf.previewUrl}
                                        alt={sf.file.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-2 flex items-center gap-1.5">
                                    <p className="text-[10px] text-[var(--foreground)] truncate flex-1" title={sf.file.name}>
                                        {sf.file.name}
                                    </p>
                                    <button
                                        onClick={() => removeStagedFile(i)}
                                        className="text-[var(--muted)] hover:text-[var(--danger)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <span className="absolute top-1.5 right-1.5 text-[9px] font-medium bg-[var(--primary)] text-white px-1.5 py-0.5 rounded-full">
                                    Staged
                                </span>
                            </div>
                        ))}
                        {/* Add more button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center py-6 hover:border-[var(--primary)] transition-colors group"
                        >
                            <Upload className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] mb-1 transition-colors" />
                            <span className="text-[10px] text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                                Add More
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                            <div className="aspect-video bg-[var(--background)] animate-pulse" />
                            <div className="p-3">
                                <div className="h-3 w-3/4 bg-[var(--background)] rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredImages.length === 0 ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] py-20 text-center">
                    <ImageIcon className="w-10 h-10 text-[var(--muted)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No images found</h3>
                    <p className="text-sm text-[var(--muted)] mb-6">
                        Upload images or add samples to the samples directory.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        Upload Images
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    {filteredImages.map((img, i) => (
                        <div
                            key={i}
                            className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--primary)] transition-colors"
                        >
                            <div className="aspect-video bg-[var(--background)] relative overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={`/api/assets?file=${encodeURIComponent(img.name)}`}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-medium text-[var(--foreground)] truncate" title={img.name}>
                                    {img.name}
                                </p>
                                <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono truncate" title={`/api/assets/${img.name}`}>
                                    /api/assets/{img.name}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Upload Card */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center py-12 hover:border-[var(--primary)] transition-colors group"
                    >
                        <Upload className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--primary)] mb-2 transition-colors" />
                        <span className="text-xs text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                            Upload Images
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}
