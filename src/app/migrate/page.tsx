"use client";

import { useState, useRef, useCallback } from "react";
import {
    Upload,
    FileText,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    Download,
    Save,
    Eye,
    Code,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    X,
    Cpu,
} from "lucide-react";
import { convertEmail, analyzeEmail } from "../actions";

type ViewMode = "source" | "preview" | "code";
type AiModel = "both" | "gemini" | "claude";

const AI_MODELS: { key: AiModel; label: string; description: string }[] = [
    { key: "both", label: "Gemini + Claude", description: "Gemini analyzes, Claude generates" },
    { key: "gemini", label: "Gemini Only", description: "Gemini 2.5 Pro for everything" },
    { key: "claude", label: "Claude Only", description: "Claude Sonnet 4 for everything" },
];

interface AnalysisResult {
    title: string;
    previewText: string;
    imageCount: number;
    blockCount: number;
    linkCount: number;
    summary: string;
}

export default function MigratePage() {
    const [htmlFile, setHtmlFile] = useState<File | null>(null);
    const [assetFiles, setAssetFiles] = useState<File[]>([]);
    const [templateName, setTemplateName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("preview");
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [aiModel, setAiModel] = useState<AiModel>("both");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const assetInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const html = files.find((f) => f.name.endsWith(".html"));
        const assets = files.filter(
            (f) =>
                f.name.endsWith(".png") ||
                f.name.endsWith(".jpg") ||
                f.name.endsWith(".jpeg") ||
                f.name.endsWith(".gif")
        );

        if (html) {
            setHtmlFile(html);
            setTemplateName(html.name.replace(".html", ""));
            const text = await html.text();
            await runAnalysis(text);
        }
        if (assets.length > 0) {
            setAssetFiles((prev) => [...prev, ...assets]);
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setHtmlFile(file);
            setTemplateName(file.name.replace(".html", ""));
            const text = await file.text();
            await runAnalysis(text);
        }
    };

    const handleAssetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAssetFiles((prev) => [...prev, ...files]);
    };

    const runAnalysis = async (htmlContent: string) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await analyzeEmail(htmlContent);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Analysis failed");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConvert = async () => {
        if (!htmlFile) return;
        setIsConverting(true);
        setError(null);
        setSaved(false);

        try {
            const formData = new FormData();
            formData.append("htmlFile", htmlFile);
            formData.append("templateName", templateName || "Untitled Template");
            formData.append("aiModel", aiModel);
            assetFiles.forEach((f, i) => formData.append(`asset_${i}`, f));

            const result = await convertEmail(formData);

            if (result.success && result.generatedHtml) {
                setGeneratedHtml(result.generatedHtml);
                setSaved(true);
            } else {
                setError(result.error || "Conversion failed");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Conversion failed");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!generatedHtml) return;
        const blob = new Blob([generatedHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${templateName || "email"}-converted.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetState = () => {
        setHtmlFile(null);
        setAssetFiles([]);
        setTemplateName("");
        setAnalysis(null);
        setGeneratedHtml(null);
        setError(null);
        setSaved(false);
    };

    return (
        <div className="p-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Migration Workspace</h1>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        Upload Mailchimp HTML and assets to generate a clean HTML email.
                    </p>
                </div>
                {generatedHtml && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download HTML
                        </button>
                        <button
                            onClick={resetState}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            New Migration
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20">
                    <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />
                    <p className="text-sm text-[var(--danger)]">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4 text-[var(--danger)]" />
                    </button>
                </div>
            )}

            {!htmlFile && !generatedHtml ? (
                /* Upload Zone */
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300
            ${isDragging ? "drop-zone-active" : "border-[var(--border)] hover:border-[var(--muted)]"}`}
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        Drag & Drop Source Files
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
                        Drop your Mailchimp HTML export and image assets here, or click to browse.
                        Supports <code className="text-[var(--accent)]">.html</code>,{" "}
                        <code className="text-[var(--accent)]">.png</code>,{" "}
                        <code className="text-[var(--accent)]">.jpg</code> files.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Select HTML File
                            </span>
                        </button>
                        <button
                            onClick={() => assetInputRef.current?.click()}
                            className="px-5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Add Images
                            </span>
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".html,.htm"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <input
                        ref={assetInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleAssetSelect}
                    />
                </div>
            ) : !generatedHtml ? (
                /* Analysis & Convert */
                <div className="grid grid-cols-5 gap-6">
                    {/* Left: Source Info */}
                    <div className="col-span-2 space-y-4">
                        {/* File Info */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Source File</h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]">
                                <FileText className="w-5 h-5 text-[var(--primary)]" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                        {htmlFile?.name}
                                    </p>
                                    <p className="text-xs text-[var(--muted)]">
                                        {((htmlFile?.size || 0) / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={resetState}
                                    className="text-[var(--muted)] hover:text-[var(--danger)]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Template Name */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <label className="text-sm font-semibold text-[var(--foreground)] mb-3 block">
                                Template Name
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                                placeholder="My Email Template"
                            />
                        </div>

                        {/* AI Model Selector */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Cpu className="w-4 h-4 text-[var(--primary)]" />
                                <label className="text-sm font-semibold text-[var(--foreground)]">
                                    AI Model
                                </label>
                            </div>
                            <div className="space-y-2">
                                {AI_MODELS.map((model) => (
                                    <button
                                        key={model.key}
                                        onClick={() => setAiModel(model.key)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200
                                            ${aiModel === model.key
                                                ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40 text-[var(--foreground)]"
                                                : "bg-[var(--background)] border border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0
                                            ${aiModel === model.key ? "border-[var(--primary)]" : "border-[var(--muted)]"}`}>
                                            {aiModel === model.key && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{model.label}</p>
                                            <p className="text-[10px] text-[var(--muted)]">{model.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assets */}
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                                    Assets ({assetFiles.length})
                                </h3>
                                <button
                                    onClick={() => assetInputRef.current?.click()}
                                    className="text-xs text-[var(--primary)] hover:underline"
                                >
                                    + Add
                                </button>
                            </div>
                            {assetFiles.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {assetFiles.map((f, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--background)]"
                                        >
                                            <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                                            <span className="text-xs text-[var(--foreground)] truncate flex-1">
                                                {f.name}
                                            </span>
                                            <button
                                                onClick={() => setAssetFiles((prev) => prev.filter((_, j) => j !== i))}
                                                className="text-[var(--muted)] hover:text-[var(--danger)]"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--muted)]">
                                    No assets added. The AI will use any images referenced in the HTML.
                                </p>
                            )}
                            <input
                                ref={assetInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleAssetSelect}
                            />
                        </div>

                        {/* Convert Button */}
                        <button
                            onClick={handleConvert}
                            disabled={isConverting || !htmlFile}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)] text-sm font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-pulse-glow"
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Converting with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Convert to HTML Email
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Analysis Panel */}
                    <div className="col-span-3">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                                <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Analysis</h3>
                                {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-[var(--muted)]" />}
                            </div>

                            {analysis ? (
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
                                            Detected Title
                                        </p>
                                        <p className="text-sm font-medium text-[var(--foreground)]">{analysis.title}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <MiniStat label="Content Blocks" value={analysis.blockCount} />
                                        <MiniStat label="Images" value={analysis.imageCount} />
                                        <MiniStat label="Links" value={analysis.linkCount} />
                                    </div>

                                    {/* Preview Text */}
                                    {analysis.previewText && (
                                        <div>
                                            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
                                                Preview Text
                                            </p>
                                            <p className="text-xs text-[var(--foreground)] bg-[var(--background)] p-2 rounded-lg">
                                                {analysis.previewText}
                                            </p>
                                        </div>
                                    )}

                                    {/* Content Summary */}
                                    <div>
                                        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">
                                            Content Map
                                        </p>
                                        <pre className="text-xs text-[var(--foreground)] bg-[var(--background)] p-3 rounded-lg overflow-auto max-h-64 font-mono whitespace-pre-wrap">
                                            {analysis.summary}
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="w-8 h-8 text-[var(--muted)] mb-3" />
                                    <p className="text-sm text-[var(--muted)]">
                                        Upload an HTML file to see the analysis
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Result View */
                <div className="space-y-4">
                    {/* Saved Banner */}
                    {saved && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                            <p className="text-sm text-[var(--success)] font-medium">
                                Template saved to Supabase successfully!
                            </p>
                        </div>
                    )}

                    {/* View Mode Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] w-fit">
                        {[
                            { key: "preview" as ViewMode, label: "Preview", icon: Eye },
                            { key: "code" as ViewMode, label: "HTML Code", icon: Code },
                            { key: "source" as ViewMode, label: "Original", icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setViewMode(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${viewMode === tab.key ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                        {viewMode === "preview" ? (
                            <div className="bg-white">
                                <iframe
                                    srcDoc={generatedHtml}
                                    className="w-full min-h-[700px] border-0"
                                    title="Email Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        ) : viewMode === "code" ? (
                            <pre className="p-6 text-xs text-[var(--foreground)] overflow-auto max-h-[700px] code-editor">
                                {generatedHtml}
                            </pre>
                        ) : (
                            <div className="bg-white">
                                <iframe
                                    srcDoc={htmlFile ? undefined : ""}
                                    src={htmlFile ? URL.createObjectURL(htmlFile) : undefined}
                                    className="w-full min-h-[700px] border-0"
                                    title="Original Source"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className="p-3 rounded-lg bg-[var(--background)]">
            <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{label}</p>
        </div>
    );
}
