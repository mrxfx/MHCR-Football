import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function teamAvatar(name: string, logo?: string) {
  if (logo) return logo;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&bold=true`;
}

export function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
