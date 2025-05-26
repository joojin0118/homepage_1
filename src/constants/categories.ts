/**
 * @file categories.ts
 * @description 상품 카테고리 관련 상수와 유틸리티
 */

// 상품 카테고리 목록
export const PRODUCT_CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "electronics", label: "전자제품" },
  { value: "fashion", label: "패션/의류" },
  { value: "beauty", label: "뷰티/화장품" },
  { value: "home", label: "홈/리빙" },
  { value: "sports", label: "스포츠/레저" },
  { value: "books", label: "도서/문구" },
  { value: "food", label: "식품/음료" },
  { value: "health", label: "건강/의료" },
  { value: "general", label: "기타" },
] as const;

// 카테고리 값 타입
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

// 실제 상품에 사용되는 카테고리 (전체 제외)
export const ACTUAL_CATEGORIES = PRODUCT_CATEGORIES.filter(
  (cat) => cat.value !== "all",
);

/**
 * 카테고리 값으로 라벨 찾기
 */
export function getCategoryLabel(value: string): string {
  const category = PRODUCT_CATEGORIES.find((cat) => cat.value === value);
  return category?.label || "알 수 없음";
}

/**
 * 카테고리 값이 유효한지 확인
 */
export function isValidCategory(value: string): boolean {
  return ACTUAL_CATEGORIES.some((cat) => cat.value === value);
}
