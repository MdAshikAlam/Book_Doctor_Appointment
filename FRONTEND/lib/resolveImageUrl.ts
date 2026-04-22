const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${API_ORIGIN}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${API_ORIGIN}/${trimmed}`;
  }

  return trimmed;
}

export function getAvatarFallback(name?: string) {
  const safeName = (name || "Doctor").trim() || "Doctor";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`;
}
