import { ImageIcon, Upload, Search } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
    // In a production app this would read from Supabase storage
    const sampleImages = [
        { name: "463d81c5-c6a3-a212-d399-59483118a4d3.jpg", type: "Hero Banner" },
        { name: "9610f6e5-1cff-5f92-0614-39693861223f.png", type: "Concert Poster" },
        { name: "18331a0d-f78a-7e0b-1bbe-9a16f0ddb6df.png", type: "CES Photo" },
        { name: "cd5ec935-0e8d-3d61-09b5-a381dd4b7c8a.jpg", type: "La Campanella Thumbnail" },
        { name: "2f89e686-ac74-706b-5a1b-ee217825f386.png", type: "Blog Post Image" },
        { name: "9eee4606-8c03-57e5-69f7-23d8f1a914d4.png", type: "Logo" },
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
                <Link
                    href="/migrate"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Upload New
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                    type="text"
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                />
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-4 gap-4">
                {sampleImages.map((img, i) => (
                    <div
                        key={i}
                        className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--primary)] transition-colors"
                    >
                        <div className="aspect-video bg-[var(--background)] flex items-center justify-center relative">
                            <ImageIcon className="w-8 h-8 text-[var(--muted)]" />
                            <div className="absolute inset-0 bg-[var(--primary)]/0 group-hover:bg-[var(--primary)]/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-xs font-medium text-[var(--primary)] bg-[var(--surface)] px-3 py-1.5 rounded-full transition-opacity">
                                    View
                                </span>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-medium text-[var(--foreground)] truncate">{img.name}</p>
                            <p className="text-[10px] text-[var(--muted)] mt-0.5">{img.type}</p>
                        </div>
                    </div>
                ))}

                {/* Upload Card */}
                <Link
                    href="/migrate"
                    className="rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center py-12 hover:border-[var(--primary)] transition-colors group"
                >
                    <Upload className="w-6 h-6 text-[var(--muted)] group-hover:text-[var(--primary)] mb-2 transition-colors" />
                    <span className="text-xs text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
                        Upload Images
                    </span>
                </Link>
            </div>
        </div>
    );
}
