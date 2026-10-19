import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUSPhoneNumber(value: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("1") && digits.length > 1) {
    const raw = digits.slice(1, 11);
    if (raw.length <= 3) return `+1 (${raw}`;
    if (raw.length <= 6) return `+1 (${raw.slice(0, 3)}) ${raw.slice(3)}`;
    return `+1 (${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
  }

  const raw = digits.slice(0, 10);
  if (raw.length <= 3) {
    return raw.length === 3 ? `(${raw}) ` : raw;
  }
  if (raw.length <= 6) {
    return `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
  }
  return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
}


export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}
