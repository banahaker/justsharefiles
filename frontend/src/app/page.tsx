"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import axios from "axios";

const EXPIRY_OPTIONS = [
  { label: "1 hour", seconds: 3600 },
  { label: "24 hours", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
];

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "done" | "error";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [ttlSeconds, setTtlSeconds] = useState(86400);
  const [state, setState] = useState<UploadState>("idle");
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFile(f: File) {
    if (f.size > MAX_SIZE_BYTES) {
      setError("File exceeds the 50MB size limit.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setState("uploading");
    setProgress(0);
    setError("");

    try {
      const { data } = await axios.post("/api/files/upload", {
        filename: file.name,
        size_bytes: file.size,
        ttl_seconds: ttlSeconds,
      });

      await axios.put(data.upload_url, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      const url = `${window.location.origin}/d/${data.id}`;
      setShareUrl(url);
      setState("done");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Upload failed. Please try again.";
      setError(msg);
      setState("error");
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setFile(null);
    setShareUrl("");
    setError("");
    setProgress(0);
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (state === "done") {
    return (
      <main className="min-h-screen bg-silver-bg flex items-center justify-center p-4">
        <div className="bg-silver-surface rounded-sm shadow-silver p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-silver-bg rounded-sm flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-silver-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-light tracking-widest text-silver-text uppercase mb-2">
            File Uploaded
          </h1>
          <p className="text-silver-accent text-sm tracking-wide mb-8">
            Share this link with anyone who needs the file.
          </p>
          <div className="flex items-center gap-2 bg-silver-bg rounded-sm p-3 mb-6 border border-silver-brand">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-silver-text outline-none truncate tracking-wide font-sans"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 px-4 py-1.5 bg-silver-accent text-white text-sm rounded-sm hover:bg-[#4B5563] transition-colors tracking-wide font-medium"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-silver-accent hover:text-silver-text tracking-widest uppercase transition-colors"
          >
            Upload another file
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-silver-bg flex items-center justify-center p-4">
      <div className="bg-silver-surface rounded-sm shadow-silver p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-widest text-silver-text uppercase">
            SecureShare
          </h1>
          <p className="text-silver-accent text-sm tracking-wide mt-2">
            Upload a file and get a temporary share link
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={`border border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors mb-4 ${
            dragging
              ? "border-silver-accent bg-silver-bg"
              : file
              ? "border-silver-brand bg-silver-bg"
              : "border-silver-brand hover:border-silver-accent hover:bg-silver-bg"
          }`}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div>
              <p className="font-medium text-silver-text tracking-wide truncate">{file.name}</p>
              <p className="text-sm text-silver-accent mt-1 tracking-wide">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-silver-brand mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-silver-text text-sm tracking-widest uppercase">Drag & drop or click to select</p>
              <p className="text-silver-accent text-xs mt-2 tracking-wide">Max 50 MB</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center tracking-wide">{error}</p>
        )}

        {/* Expiry selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-silver-accent tracking-widest uppercase mb-3">
            Link expires in
          </label>
          <div className="grid grid-cols-4 gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => setTtlSeconds(opt.seconds)}
                className={`py-2 px-1 rounded-sm text-xs font-medium tracking-wide transition-colors ${
                  ttlSeconds === opt.seconds
                    ? "bg-silver-accent text-white"
                    : "bg-silver-bg text-silver-text border border-silver-brand hover:border-silver-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload button / progress */}
        {state === "uploading" ? (
          <div>
            <div className="w-full bg-silver-bg rounded-full h-[2px] mb-3 overflow-hidden">
              <div
                className="bg-silver-accent h-[2px] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-silver-accent tracking-widest uppercase">
              {progress}% uploaded
            </p>
          </div>
        ) : (
          <button
            onClick={handleUpload}
            disabled={!file}
            className="w-full py-3 bg-silver-accent text-white rounded-sm font-medium tracking-widest uppercase text-sm hover:bg-[#4B5563] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Upload & Generate Link
          </button>
        )}
      </div>
    </main>
  );
}
