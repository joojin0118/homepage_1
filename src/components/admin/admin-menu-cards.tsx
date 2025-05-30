/**
 * @file admin-menu-cards.tsx
 * @description 관리자 대시보드 메뉴 카드 컴포넌트
 *
 * 주요 기능:
 * 1. 관리자 메뉴 카드 표시
 * 2. 스무스 스크롤링 앵커 링크
 * 3. 다양한 관리 페이지로의 링크
 */

"use client";

import Link from "next/link";
import { Shield, Package, ShoppingCart, FolderOpen, Users } from "lucide-react";

interface AdminMenuCardsProps {
  onFileManagementClick?: () => void;
}

// 관리 메뉴 카드 컴포넌트
export function AdminMenuCards({ onFileManagementClick }: AdminMenuCardsProps) {
  const menuItems = [
    {
      title: "상품 관리",
      description: "상품 목록, 재고 관리, 상품 등록/수정",
      href: "/admin/products",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "주문 관리",
      description: "주문 내역, 배송 상태 관리",
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      title: "파일 관리",
      description: "이미지 및 문서 파일 업로드/관리",
      href: "#file-section",
      icon: FolderOpen,
      color: "bg-purple-500",
      isFileManagement: true,
    },
    {
      title: "사용자 관리",
      description: "회원 목록 및 권한 관리",
      href: "/admin/users",
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  // 파일 관리 클릭 핸들러
  const handleFileManagementClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFileManagementClick) {
      onFileManagementClick();
    }
  };

  return (
    <section className="bg-white rounded-lg border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">관리 메뉴</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon;

          if (item.isFileManagement) {
            return (
              <button
                key={item.title}
                onClick={handleFileManagementClick}
                className="group block p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={`p-3 ${item.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group block p-6 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`p-3 ${item.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
