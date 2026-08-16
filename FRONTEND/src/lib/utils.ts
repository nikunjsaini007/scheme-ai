import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize a date string to YYYY-MM-DD format for HTML date input.
 * Handles various input formats and avoids timezone shifting issues.
 */
export function normalizeDateForInput(dateValue: unknown): string {
  if (!dateValue) return "";

  const str = String(dateValue).trim();
  if (!str) return "";

  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Try to parse the date and format as YYYY-MM-DD
  // Use local date components to avoid timezone shifting
  const date = new Date(str);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string from HTML date input (YYYY-MM-DD) to a Date object
 * using local timezone to avoid off-by-one errors.
 */
export function parseDateFromInput(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}
