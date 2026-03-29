// force-static: tell Next.js to skip dynamic API checks (searchParams etc.)
// during static generation. The client component reads params at runtime.
export const dynamic = "force-static";

// generateStaticParams is required for dynamic routes with `output: "export"`.
// Returns a placeholder so Next.js emits an HTML shell at /d/_/index.html.
// Nginx rewrites all /d/*/ requests to that shell; the client component then
// reads the real ID from the browser URL via useParams().
export function generateStaticParams() {
  return [{ id: "_" }];
}

export { default } from "./DownloadClient";
