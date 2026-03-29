"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import axios from "axios";

const EXPIRY_OPTIONS = [
  { label: "1 hour", seconds: 3600 },
  { label: "24 hours", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
];

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

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
      // Step 1: Request presigned PUT URL from backend
      const { data } = await axios.post("/api/files/upload", {
        filename: file.name,
        size_bytes: file.size,
        ttl_seconds: ttlSeconds,
      });

      // Step 2: PUT file directly to MinIO
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
      const msg =
        err?.response?.data?.detail || "Upload failed. Please try again.";
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
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Uploaded!</h1>
          <p className="text-gray-500 mb-6">Share this link with anyone who needs the file.</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 mb-4">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Upload another file
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SecureShare</h1>
          <p className="text-gray-500 mt-1">Upload a file and get a temporary share link</p>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
            dragging ? "border-blue-500 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
          {file ? (
            <div>
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600">Drag & drop or click to select</p>
              <p className="text-sm text-gray-400 mt-1">Max 50MB</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Expiry selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Link expires in</label>
          <div className="grid grid-cols-4 gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                onClick={() => setTtlSeconds(opt.seconds)}
                className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                  ttlSeconds === opt.seconds
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload button */}
        {state === "uploading" ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-500">{progress}% uploaded...</p>
          </div>
        ) : (
          <button
            onClick={handleUpload}
            disabled={!file}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Upload & Generate Link
          </button>
        )}
      </div>
    </main>
  );
}
