/**
 * @file use-cart.ts
 * @description TanStack Query를 사용한 최적화된 장바구니 hooks
 *
 * 이 파일은 장바구니 관련 데이터 fetching과 mutations를 관리합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 조회 (useCartItems)
 * 2. 장바구니 아이템 수 조회 (useCartCount)
 * 3. 장바구니 아이템 추가 (useAddToCart)
 * 4. 장바구니 수량 변경 (useUpdateCartQuantity)
 * 5. 장바구니 아이템 삭제 (useRemoveFromCart)
 * 6. Optimistic Updates 지원
 * 7. 자동 캐시 무효화
 *
 * @dependencies
 * - @tanstack/react-query: 데이터 fetching 및 캐싱
 * - @/actions/cart: 장바구니 서버 액션
 * - @/components/auth/auth-provider: 인증 상태 확인
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import type { CartItem } from "@/actions/cart";

// Query Keys 상수 정의
export const CART_QUERY_KEYS = {
  all: ['cart'] as const,
  items: () => [...CART_QUERY_KEYS.all, 'items'] as const,
  count: () => [...CART_QUERY_KEYS.all, 'count'] as const,
} as const;

/**
 * 장바구니 아이템 목록 조회 hook
 */
export function useCartItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: CART_QUERY_KEYS.items(),
    queryFn: async (): Promise<{ items: CartItem[]; totalAmount: number; totalItems: number }> => {
      if (!user) {
        return { items: [], totalAmount: 0, totalItems: 0 };
      }

      console.log("🔄 useCartItems 쿼리 실행 - 사용자:", user.id);

      const { getCartItems } = await import("@/actions/cart");
      const result = await getCartItems();
      
      console.log("🔄 useCartItems 결과:", {
        아이템수: result.items?.length || 0,
        총수량: result.totalItems,
        총액: result.totalAmount,
      });

      return {
        items: result.items || [],
        totalAmount: result.totalAmount || 0,
        totalItems: result.totalItems || 0,
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
}

/**
 * 장바구니 아이템 수 조회 hook
 */
export function useCartCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: CART_QUERY_KEYS.count(),
    queryFn: async (): Promise<number> => {
      if (!user) return 0;

      console.log("🔄 useCartCount 쿼리 실행 - 사용자:", user.id);

      const { getCartItems } = await import("@/actions/cart");
      const result = await getCartItems();
      
      console.log("🔄 useCartCount 결과:", result.totalItems || 0);

      return result.totalItems || 0;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2분간 fresh
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
  });
}

/**
 * 장바구니 아이템 추가 mutation hook
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const { addToCart } = await import("@/actions/cart");
      const result = await addToCart(productId, quantity);
      
      if (!result.success) {
        throw new Error(result.message || '장바구니 추가에 실패했습니다.');
      }
      
      return result;
    },
    onMutate: async ({ quantity }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.all });

      // 이전 값 스냅샷
      const previousCount = queryClient.getQueryData(CART_QUERY_KEYS.count()) as number || 0;

      // Optimistic update
      queryClient.setQueryData(CART_QUERY_KEYS.count(), previousCount + quantity);

      return { previousCount };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(CART_QUERY_KEYS.count(), context.previousCount);
      }
      console.error('장바구니 추가 실패:', error);
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
    },
  });
}

/**
 * 장바구니 수량 변경 mutation hook
 */
export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, newQuantity }: { itemId: number; newQuantity: number }) => {
      const { updateCartItemQuantity } = await import("@/actions/cart");
      const result = await updateCartItemQuantity(itemId, newQuantity);
      
      if (!result.success) {
        throw new Error(result.message || '수량 변경에 실패했습니다.');
      }
      
      return result;
    },
    onMutate: async ({ itemId, newQuantity }) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.items() });

      // 이전 값 스냅샷
      const previousData = queryClient.getQueryData(CART_QUERY_KEYS.items()) as {
        items: CartItem[];
        totalAmount: number;
        totalItems: number;
      } | undefined;

      if (previousData) {
        // Optimistic update
        const updatedItems = previousData.items.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const updatedItem = updatedItems.find(item => item.id === itemId);
        const quantityDiff = updatedItem ? newQuantity - (previousData.items.find(item => item.id === itemId)?.quantity || 0) : 0;
        const priceDiff = updatedItem ? quantityDiff * updatedItem.product.price : 0;

        const optimisticData = {
          items: updatedItems,
          totalAmount: previousData.totalAmount + priceDiff,
          totalItems: previousData.totalItems + quantityDiff,
        };

        queryClient.setQueryData(CART_QUERY_KEYS.items(), optimisticData);
        queryClient.setQueryData(CART_QUERY_KEYS.count(), optimisticData.totalItems);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousData) {
        queryClient.setQueryData(CART_QUERY_KEYS.items(), context.previousData);
        queryClient.setQueryData(CART_QUERY_KEYS.count(), context.previousData.totalItems);
      }
      console.error('수량 변경 실패:', error);
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화 (서버와 동기화)
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
    },
  });
}

/**
 * 장바구니 아이템 삭제 mutation hook
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const { removeFromCart } = await import("@/actions/cart");
      const result = await removeFromCart(itemId);
      
      if (!result.success) {
        throw new Error(result.message || '아이템 삭제에 실패했습니다.');
      }
      
      return result;
    },
    onMutate: async (itemId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.items() });

      // 이전 값 스냅샷
      const previousData = queryClient.getQueryData(CART_QUERY_KEYS.items()) as {
        items: CartItem[];
        totalAmount: number;
        totalItems: number;
      } | undefined;

      if (previousData) {
        // 삭제할 아이템 찾기
        const itemToRemove = previousData.items.find(item => item.id === itemId);
        
        if (itemToRemove) {
          // Optimistic update
          const optimisticData = {
            items: previousData.items.filter(item => item.id !== itemId),
            totalAmount: previousData.totalAmount - (itemToRemove.quantity * itemToRemove.product.price),
            totalItems: previousData.totalItems - itemToRemove.quantity,
          };

          queryClient.setQueryData(CART_QUERY_KEYS.items(), optimisticData);
          queryClient.setQueryData(CART_QUERY_KEYS.count(), optimisticData.totalItems);
        }
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousData) {
        queryClient.setQueryData(CART_QUERY_KEYS.items(), context.previousData);
        queryClient.setQueryData(CART_QUERY_KEYS.count(), context.previousData.totalItems);
      }
      console.error('아이템 삭제 실패:', error);
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
    },
  });
}

/**
 * 장바구니 전체 비우기 mutation hook
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { clearCart } = await import("@/actions/cart");
      const result = await clearCart();
      
      if (!result.success) {
        throw new Error(result.message || '장바구니 비우기에 실패했습니다.');
      }
      
      return result;
    },
    onMutate: async () => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEYS.all });

      // 이전 값 스냅샷
      const previousData = queryClient.getQueryData(CART_QUERY_KEYS.items());

      // Optimistic update
      const emptyData = { items: [], totalAmount: 0, totalItems: 0 };
      queryClient.setQueryData(CART_QUERY_KEYS.items(), emptyData);
      queryClient.setQueryData(CART_QUERY_KEYS.count(), 0);

      return { previousData };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousData) {
        queryClient.setQueryData(CART_QUERY_KEYS.items(), context.previousData);
        const totalItems = (context.previousData as any)?.totalItems || 0;
        queryClient.setQueryData(CART_QUERY_KEYS.count(), totalItems);
      }
      console.error('장바구니 비우기 실패:', error);
    },
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.all });
    },
  });
} 