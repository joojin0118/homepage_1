"use client"

import { Heart, Menu, Search, ShoppingBag, Star, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Component() {
  const categories = [
    { name: "패션", image: "/placeholder.svg?height=200&width=200" },
    { name: "전자제품", image: "/placeholder.svg?height=200&width=200" },
    { name: "홈&리빙", image: "/placeholder.svg?height=200&width=200" },
    { name: "뷰티", image: "/placeholder.svg?height=200&width=200" },
    { name: "스포츠", image: "/placeholder.svg?height=200&width=200" },
    { name: "도서", image: "/placeholder.svg?height=200&width=200" },
  ]

  const featuredProducts = [
    {
      id: 1,
      name: "프리미엄 무선 이어폰",
      price: "129,000원",
      originalPrice: "159,000원",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.8,
      reviews: 124,
      discount: "19%",
    },
    {
      id: 2,
      name: "스마트 워치 프로",
      price: "299,000원",
      originalPrice: "349,000원",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.9,
      reviews: 89,
      discount: "14%",
    },
    {
      id: 3,
      name: "미니멀 백팩",
      price: "89,000원",
      originalPrice: "119,000원",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.7,
      reviews: 156,
      discount: "25%",
    },
    {
      id: 4,
      name: "오가닉 스킨케어 세트",
      price: "79,000원",
      originalPrice: "99,000원",
      image: "/placeholder.svg?height=300&width=300",
      rating: 4.6,
      reviews: 203,
      discount: "20%",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <Link href="#" className="text-lg font-medium">
                    홈
                  </Link>
                  <Link href="#" className="text-lg font-medium">
                    카테고리
                  </Link>
                  <Link href="#" className="text-lg font-medium">
                    베스트
                  </Link>
                  <Link href="#" className="text-lg font-medium">
                    세일
                  </Link>
                  <Link href="#" className="text-lg font-medium">
                    브랜드
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">ShopMall</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-sm font-medium hover:text-orange-500 transition-colors">
                홈
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-orange-500 transition-colors">
                카테고리
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-orange-500 transition-colors">
                베스트
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-orange-500 transition-colors">
                세일
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-orange-500 transition-colors">
                브랜드
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="상품을 검색해보세요..." className="pl-10 pr-4" />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-50 to-red-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                새로운 쇼핑의
                <span className="text-orange-500"> 경험</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                최고의 품질과 합리적인 가격으로 만나는 프리미엄 쇼핑몰입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  지금 쇼핑하기
                </Button>
                <Button variant="outline" size="lg">
                  카테고리 보기
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Hero Image"
                width={500}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 카테고리</h2>
            <p className="text-gray-600">다양한 카테고리에서 원하는 상품을 찾아보세요</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 상품</h2>
            <p className="text-gray-600">고객들이 가장 많이 찾는 베스트 상품들</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-500">{product.discount} 할인</Badge>
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews})</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">{product.price}</span>
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">장바구니 담기</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">특별 혜택을 놓치지 마세요</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">신상품 소식과 독점 할인 혜택을 가장 먼저 받아보세요</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input placeholder="이메일 주소를 입력하세요" className="flex-1 bg-white" />
            <Button className="bg-orange-500 hover:bg-orange-600">구독하기</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-xl">ShopMall</span>
              </div>
              <p className="text-gray-600 text-sm">최고의 쇼핑 경험을 제공하는 프리미엄 온라인 쇼핑몰입니다.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">고객 서비스</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    고객센터
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    배송 안내
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    반품/교환
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">회사 정보</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    채용 정보
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">연결하기</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-500">
                    YouTube
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 ShopMall. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
