const LOCAL_API = "http://localhost:8000";

function stripTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBase() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalized = envUrl ? stripTrailingSlash(envUrl) : "";

  if (typeof window === "undefined") {
    return normalized || LOCAL_API;
  }

  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1";
  if (isLocal) {
    return normalized || LOCAL_API;
  }

  // Use same-origin + Next.js rewrites in production to avoid CORS issues.
  return "";
}
