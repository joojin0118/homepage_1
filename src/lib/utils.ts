import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자를 한국 원화 형식으로 포맷팅합니다.
 * @param price - 포맷팅할 가격 (숫자)
 * @returns 쉼표가 포함된 가격 문자열
 * @example formatPrice(1234567) // "1,234,567"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}
