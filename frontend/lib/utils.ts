export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || "http://localhost:8000/media";

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder-product.svg";
  if (path.startsWith("http")) return path;
  return `${MEDIA_URL}/${path.replace(/^\//, "")}`;
}

export function formatPrice(amount: number, currency = "KES"): string {
  return `${currency} ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
