/**
 * @file admin/products/new/page.tsx
 * @description 관리자 새 상품 등록 페이지
 *
 * 주요 기능:
 * 1. 상품 정보 입력 폼
 * 2. 실시간 유효성 검사
 * 3. 상품 등록 처리
 * 4. 성공/실패 상태 관리
 * 5. 반응형 레이아웃
 *
 * @dependencies
 * - @/actions/products: 상품 서버 액션
 * - @/components/nav/navbar: 네비게이션 바
 * - @/components/ui: ShadcnUI 컴포넌트들
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/products";
import { Navbar } from "@/components/nav/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTUAL_CATEGORIES } from "@/constants/categories";
import {
  ArrowLeft,
  Package,
  Save,
  AlertCircle,
  CheckCircle2,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

// 폼 에러 타입
interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  stock_quantity?: string;
  category?: string;
  general?: string;
}

// 상품 추가 페이지
export default function NewProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  console.log("📦 새 상품 등록 페이지 렌더링");

  // 폼 제출 처리
  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setSuccess(false);

      console.log("📦 상품 등록 시작");

      const result = await createProduct(formData);

      if (result.success) {
        setSuccess(true);
        console.log("✅ 상품 등록 성공:", result.productId);

        // 2초 후 상품 관리 페이지로 이동
        setTimeout(() => {
          router.push("/admin/products");
        }, 2000);
      } else {
        setErrors({ general: result.message });
        console.error("❌ 상품 등록 실패:", result.message);
      }
    } catch (error) {
      console.error("상품 등록 오류:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "상품 등록 중 오류가 발생했습니다.";
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 개별 필드 유효성 검사
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "상품명은 필수입니다.";
        } else if (value.length > 100) {
          newErrors.name = "상품명은 100자 이내로 입력해주세요.";
        } else {
          delete newErrors.name;
        }
        break;

      case "price":
        const price = parseFloat(value);
        if (!value || isNaN(price)) {
          newErrors.price = "올바른 가격을 입력해주세요.";
        } else if (price < 0) {
          newErrors.price = "가격은 0 이상이어야 합니다.";
        } else if (price > 10000000) {
          newErrors.price = "가격은 1,000만원 이하로 입력해주세요.";
        } else {
          delete newErrors.price;
        }
        break;

      case "stock_quantity":
        const stock = parseInt(value);
        if (!value || isNaN(stock)) {
          newErrors.stock_quantity = "올바른 재고 수량을 입력해주세요.";
        } else if (stock < 0) {
          newErrors.stock_quantity = "재고 수량은 0 이상이어야 합니다.";
        } else if (stock > 99999) {
          newErrors.stock_quantity =
            "재고 수량은 99,999개 이하로 입력해주세요.";
        } else {
          delete newErrors.stock_quantity;
        }
        break;

      case "image_url":
        if (value && !isValidUrl(value)) {
          newErrors.image_url = "올바른 URL 형식을 입력해주세요.";
        } else {
          delete newErrors.image_url;
        }
        break;

      case "description":
        if (value.length > 1000) {
          newErrors.description = "상품 설명은 1,000자 이내로 입력해주세요.";
        } else {
          delete newErrors.description;
        }
        break;

      case "category":
        if (!value) {
          newErrors.category = "카테고리를 선택해주세요.";
        } else {
          delete newErrors.category;
        }
        break;
    }

    setErrors(newErrors);
  };

  // URL 유효성 검사
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // 인증 중이면 로딩 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 mx-auto text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
              <p className="text-gray-600 mb-6">
                상품을 등록하려면 먼저 로그인해주세요.
              </p>
              <Link href="/login">
                <Button>로그인하러 가기</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* 헤더 */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  상품 목록으로
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h1 className="text-2xl font-bold">새 상품 등록</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 상품 등록 폼 */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* 성공 메시지 */}
            {success && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>
                      상품이 성공적으로 등록되었습니다! 잠시 후 상품 목록으로
                      이동합니다.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 일반 에러 메시지 */}
            {errors.general && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{errors.general}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>상품 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={handleSubmit} className="space-y-6">
                  {/* 상품명 */}
                  <div className="space-y-2">
                    <Label htmlFor="name">상품명 *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="상품명을 입력해주세요"
                      required
                      disabled={isSubmitting || success}
                      onChange={(e) => validateField("name", e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* 상품 설명 */}
                  <div className="space-y-2">
                    <Label htmlFor="description">상품 설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="상품에 대한 상세한 설명을 입력해주세요"
                      rows={4}
                      disabled={isSubmitting || success}
                      onChange={(e) =>
                        validateField("description", e.target.value)
                      }
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* 가격 */}
                  <div className="space-y-2">
                    <Label htmlFor="price">가격 (원) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      max="10000000"
                      step="1"
                      placeholder="예: 25000"
                      required
                      disabled={isSubmitting || success}
                      onChange={(e) => validateField("price", e.target.value)}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  {/* 재고 수량 */}
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">재고 수량 *</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      min="0"
                      max="99999"
                      step="1"
                      placeholder="예: 100"
                      required
                      disabled={isSubmitting || success}
                      onChange={(e) =>
                        validateField("stock_quantity", e.target.value)
                      }
                    />
                    {errors.stock_quantity && (
                      <p className="text-sm text-red-600">
                        {errors.stock_quantity}
                      </p>
                    )}
                  </div>

                  {/* 이미지 URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image_url">이미지 URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      type="url"
                      placeholder="예: https://example.com/image.jpg"
                      disabled={isSubmitting || success}
                      onChange={(e) =>
                        validateField("image_url", e.target.value)
                      }
                    />
                    {errors.image_url && (
                      <p className="text-sm text-red-600">{errors.image_url}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      상품 이미지의 URL을 입력해주세요. 비워두면 기본 이미지가
                      사용됩니다.
                    </p>
                  </div>

                  {/* 카테고리 */}
                  <div className="space-y-2">
                    <Label htmlFor="category">카테고리 *</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        validateField("category", value);
                      }}
                      disabled={isSubmitting || success}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택해주세요">
                          {selectedCategory && (
                            <div className="flex items-center">
                              <Grid3X3 className="h-4 w-4 mr-2" />
                              {
                                ACTUAL_CATEGORIES.find(
                                  (cat) => cat.value === selectedCategory,
                                )?.label
                              }
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ACTUAL_CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            <div className="flex items-center">
                              <Grid3X3 className="h-4 w-4 mr-2" />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      name="category"
                      value={selectedCategory}
                    />
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        success ||
                        Object.keys(errors).length > 0
                      }
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>등록 중...</span>
                        </div>
                      ) : success ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>등록 완료</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          <span>상품 등록</span>
                        </div>
                      )}
                    </Button>

                    <Link href="/admin/products">
                      <Button variant="outline" disabled={isSubmitting}>
                        취소
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
