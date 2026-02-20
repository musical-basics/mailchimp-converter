"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, X, ImageIcon } from "lucide-react";

interface AssetImage {
    name: string;
    path: string;
}

export default function LibraryPage() {
    const [images, setImages] = useState<AssetImage[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
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

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newUploaded = files.map((f) => ({
            name: f.name,
            url: URL.createObjectURL(f),
        }));
        setUploadedFiles((prev) => [...prev, ...newUploaded]);
    };

    const filteredImages = images.filter((img) =>
        img.name.toLowerCase().includes(search.toLowerCase())
    );

    const allDisplayImages = [
        ...filteredImages.map((img) => ({
            name: img.name,
            src: `/api/assets?file=${encodeURIComponent(img.name)}`,
            isUploaded: false,
        })),
        ...uploadedFiles
            .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
            .map((f) => ({
                name: f.name,
                src: f.url,
                isUploaded: true,
            })),
    ];

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
                    onChange={handleUpload}
                />
            </div>

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
            ) : allDisplayImages.length === 0 ? (
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
                    {allDisplayImages.map((img, i) => (
                        <div
                            key={i}
                            className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--primary)] transition-colors"
                        >
                            <div className="aspect-video bg-[var(--background)] relative overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Hide broken images and show fallback
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        target.parentElement!.classList.add("flex", "items-center", "justify-center");
                                        const icon = document.createElement("div");
                                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--muted)]"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                                        target.parentElement!.appendChild(icon);
                                    }}
                                />
                                {img.isUploaded && (
                                    <span className="absolute top-2 right-2 text-[10px] font-medium bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                                        New
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-medium text-[var(--foreground)] truncate" title={img.name}>
                                    {img.name}
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
