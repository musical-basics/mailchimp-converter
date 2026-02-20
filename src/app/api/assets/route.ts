import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

const SAMPLES_DIR = path.join(process.cwd(), "samples");

// GET /api/assets — list all image assets
// GET /api/assets?file=filename.png — serve a specific file
export async function GET(request: NextRequest) {
    const file = request.nextUrl.searchParams.get("file");

    if (file) {
        // Serve a specific file
        try {
            // Find the file recursively in samples
            const filePath = await findFile(SAMPLES_DIR, file);
            if (!filePath) {
                return NextResponse.json({ error: "File not found" }, { status: 404 });
            }

            const buffer = await readFile(filePath);
            const ext = path.extname(file).toLowerCase();
            const mimeTypes: Record<string, string> = {
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
            };

            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": mimeTypes[ext] || "application/octet-stream",
                    "Cache-Control": "public, max-age=31536000",
                },
            });
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }
    }

    // List all image assets
    try {
        const images = await collectImages(SAMPLES_DIR);
        return NextResponse.json({ images });
    } catch {
        return NextResponse.json({ images: [] });
    }
}

async function collectImages(dir: string, prefix = ""): Promise<{ name: string; path: string }[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const images: { name: string; path: string }[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const sub = await collectImages(fullPath, `${prefix}${entry.name}/`);
            images.push(...sub);
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
                images.push({
                    name: entry.name,
                    path: `${prefix}${entry.name}`,
                });
            }
        }
    }

    return images;
}

async function findFile(dir: string, filename: string): Promise<string | null> {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const found = await findFile(fullPath, filename);
            if (found) return found;
        } else if (entry.name === filename) {
            return fullPath;
        }
    }

    return null;
}
