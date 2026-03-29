"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type State = "loading" | "downloading" | "error";

export default function DownloadPage() {
  const [state, setState] = useState<State>("loading");
  const [filename, setFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // useParams() returns "_" (the static-generation placeholder) when Nginx
    // serves /d/_/index.html for any /d/{id}/ request. Read the real ID from
    // window.location.pathname instead.
    const match = window.location.pathname.match(/\/d\/([^/]+)/);
    const id = match?.[1];
    if (!id || id === "_") return;

    async function fetchDownload() {
      try {
        const { data } = await axios.get(`/api/files/${id}/download`);
        setFilename(data.original_filename);
        setState("downloading");
        window.location.href = data.download_url;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          setErrorMsg("This link has expired or does not exist.");
        } else if (status === 429) {
          setErrorMsg("Too many requests. Please try again in a moment.");
        } else {
          setErrorMsg("Something went wrong. Please try again.");
        }
        setState("error");
      }
    }

    fetchDownload();
  }, []);

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-silver-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-silver-surface border-t-silver-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-silver-accent text-xs tracking-widest uppercase">Preparing download</p>
        </div>
      </main>
    );
  }

  if (state === "downloading") {
    return (
      <main className="min-h-screen bg-silver-bg flex items-center justify-center p-4">
        <div className="bg-silver-surface rounded-sm shadow-silver p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-silver-bg rounded-sm flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-silver-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h1 className="text-2xl font-light tracking-widest text-silver-text uppercase mb-2">
            Downloading
          </h1>
          <p className="text-silver-accent text-sm tracking-wide">
            <span className="font-medium text-silver-text">{filename}</span>{" "}
            should start automatically.
          </p>
          <p className="text-xs text-silver-brand mt-3 tracking-wide">
            If it doesn&apos;t start,{" "}
            <a href="#" className="text-silver-accent underline hover:text-silver-text transition-colors">
              click here
            </a>
            .
          </p>
          <div className="mt-8 pt-6 border-t border-silver-brand">
            <p className="text-xs text-silver-brand tracking-widest uppercase mb-4">
              Want to share your own files?
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2.5 bg-silver-accent text-white rounded-sm font-medium tracking-widest uppercase text-sm hover:bg-[#4B5563] transition-colors"
            >
              Share Your Own Files
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-silver-bg flex items-center justify-center p-4">
      <div className="bg-silver-surface rounded-sm shadow-silver p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-silver-bg rounded-sm flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-light tracking-widest text-silver-text uppercase mb-2">
          Link Not Found
        </h1>
        <p className="text-silver-accent text-sm tracking-wide">{errorMsg}</p>
        <a
          href="/"
          className="inline-block mt-8 px-6 py-2.5 bg-silver-accent text-white rounded-sm font-medium tracking-widest uppercase text-sm hover:bg-[#4B5563] transition-colors"
        >
          Upload a New File
        </a>
      </div>
    </main>
  );
}
