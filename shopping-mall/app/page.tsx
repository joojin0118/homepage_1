import { Search, ShoppingCart, User, Menu, Star, Heart, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">SHOP</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                홈
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                카테고리
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                신상품
              </Link>
              <Link href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
                세일
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="상품을 검색해보세요"
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-700">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-700 relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                  2
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                새로운 스타일을
                <br />
                <span className="text-gray-600">발견하세요</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                트렌디하고 품질 좋은 제품들을 합리적인 가격에 만나보세요. 당신만의 특별한 스타일을 완성해드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3">
                  쇼핑 시작하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 px-8 py-3">
                  카탈로그 보기
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="Hero Image"
                width={500}
                height={500}
                className="rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "의류", image: "/placeholder.svg?height=200&width=200" },
              { name: "신발", image: "/placeholder.svg?height=200&width=200" },
              { name: "가방", image: "/placeholder.svg?height=200&width=200" },
              { name: "액세서리", image: "/placeholder.svg?height=200&width=200" },
            ].map((category, index) => (
              <Card
                key={index}
                className="group cursor-pointer border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">인기 상품</h2>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              전체보기
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "클래식 화이트 셔츠",
                price: "89,000",
                originalPrice: "120,000",
                rating: 4.8,
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "데님 자켓",
                price: "156,000",
                originalPrice: null,
                rating: 4.9,
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "레더 스니커즈",
                price: "198,000",
                originalPrice: "250,000",
                rating: 4.7,
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "미니멀 백팩",
                price: "78,000",
                originalPrice: null,
                rating: 4.6,
                image: "/placeholder.svg?height=300&width=300",
              },
            ].map((product, index) => (
              <Card
                key={index}
                className="group cursor-pointer border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    {product.originalPrice && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white">SALE</Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{product.price}원</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}원</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">뉴스레터 구독</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            새로운 상품 출시 소식과 특별 할인 혜택을 가장 먼저 받아보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="이메일 주소를 입력하세요" className="bg-white border-gray-300" />
            <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8">구독하기</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">SHOP</span>
              </div>
              <p className="text-gray-600">고품질 제품과 최상의 서비스로 고객 만족을 추구합니다.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">쇼핑</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    신상품
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    베스트
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    세일
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    브랜드
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">고객서비스</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    주문/배송
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    교환/반품
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    1:1 문의
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">회사정보</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    회사소개
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900">
                    채용정보
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 SHOP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
