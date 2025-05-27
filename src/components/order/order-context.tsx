/**
 * @file order-context.tsx
 * @description 주문 처리 상태 전역 관리 Context
 *
 * 주요 기능:
 * 1. 전역 주문 처리 상태 관리
 * 2. 중복 주문 방지
 * 3. 주문 진행 중 다른 주문 차단
 *
 * @dependencies
 * - React Context API
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface OrderContextType {
  isOrderProcessing: boolean;
  setOrderProcessing: (processing: boolean) => void;
  canStartOrder: () => boolean;
}

const OrderContext = createContext<OrderContextType>({
  isOrderProcessing: false,
  setOrderProcessing: () => {},
  canStartOrder: () => true,
});

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);

  const setOrderProcessing = useCallback((processing: boolean) => {
    console.log("[OrderContext] 주문 처리 상태 변경:", processing);
    setIsOrderProcessing(processing);
  }, []);

  const canStartOrder = useCallback(() => {
    const canStart = !isOrderProcessing;
    console.log("[OrderContext] 주문 시작 가능 여부:", canStart);
    return canStart;
  }, [isOrderProcessing]);

  return (
    <OrderContext.Provider
      value={{
        isOrderProcessing,
        setOrderProcessing,
        canStartOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
};
