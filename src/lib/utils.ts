import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Loại bỏ dấu tiếng Việt và chuyển thành lowercase
 * Ví dụ: "Hà Nội" -> "ha noi", "Đà Nẵng" -> "da nang"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
}
