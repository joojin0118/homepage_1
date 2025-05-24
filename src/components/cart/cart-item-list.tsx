/**
 * @file cart-item-list.tsx
 * @description 장바구니 아이템 목록 컴포넌트
 *
 * 주요 기능:
 * 1. 장바구니 아이템들을 목록으로 표시
 * 2. 개별 아이템 카드 렌더링
 * 3. 아이템별 상호작용 관리
 *
 * @dependencies
 * - @/components/cart/cart-item-card: 개별 아이템 카드
 * - @/actions/cart: 장바구니 타입 정의
 */

"use client";

import { CartItemCard } from "./cart-item-card";
import type { CartItem } from "@/actions/cart";

interface CartItemListProps {
  items: CartItem[];
}

export function CartItemList({ items }: CartItemListProps) {
  console.log("🛒 CartItemList 렌더링:", items.length, "개 아이템");

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </div>
  );
} 