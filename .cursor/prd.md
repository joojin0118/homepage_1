# ShopMall - 2-3주 완성 목표 PRD (Simplified MVP)

## 프로젝트 개요

### 프로젝트 명

ShopMall - 간소화된 온라인 쇼핑몰 MVP

### 프로젝트 목적

2-3주 내 완성 가능한 기본 쇼핑몰 기능을 갖춘 플랫폼 구축

### 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: TailwindCSS, ShadcnUI
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (이미 구현됨)
- **State Management**: React Hook Form, Zod
- **Icons**: Lucide React

## 데이터베이스 스키마 ✅ 완료

### 1. Profiles (사용자 프로필) ✅ 기존 활용

```sql
- id: uuid (Primary Key, Auth User ID)
- created_at: timestamptz (기본값: now())
- name: text (사용자 이름)
- is_admin: boolean (관리자 권한, 기본값: false)
```

### 2. Products (상품) ✅ 생성 완료

```sql
- id: bigint (Primary Key, auto-increment)
- created_at: timestamptz (기본값: now())
- name: text (상품명, NOT NULL)
- description: text (상품 설명)
- price: numeric (가격, NOT NULL, CHECK: price > 0)
- image_url: text (상품 이미지 URL)
- created_by: uuid (FK to profiles.id)
- stock_quantity: integer (재고 수량, 기본값: 0, CHECK: stock_quantity >= 0)
```

### 3. Cart Items (장바구니) ✅ 생성 완료

```sql
- id: bigint (Primary Key, auto-increment)
- created_at: timestamptz (기본값: now())
- user_id: uuid (FK to profiles.id)
- product_id: bigint (FK to products.id)
- quantity: integer (수량, 기본값: 1, CHECK: quantity > 0)
```

### 4. Orders (주문) ✅ 생성 완료

```sql
- id: bigint (Primary Key, auto-increment)
- created_at: timestamptz (기본값: now())
- user_id: uuid (FK to profiles.id, NOT NULL)
- status: text (주문 상태: 'pending', 'completed', 'cancelled', NOT NULL)
- total_amount: numeric (총 주문 금액, NOT NULL)
```

### 5. Order Items (주문 상품) ✅ 생성 완료

```sql
- id: bigint (Primary Key, auto-increment)
- created_at: timestamptz (기본값: now())
- order_id: bigint (FK to orders.id, NOT NULL)
- product_id: bigint (FK to products.id, NOT NULL)
- quantity: integer (수량, NOT NULL, CHECK: quantity > 0)
- price_at_time: numeric (주문 시점 가격, NOT NULL, CHECK: price_at_time >= 0)
```

### 데이터베이스 제약 조건 및 특징

- **RLS (Row Level Security)**: 모든 테이블에 활성화
- **외래 키 관계**: profiles ↔ products, cart_items, orders ↔ order_items
- **체크 제약**: 가격, 수량, 재고에 대한 유효성 검사
- **기본값**: created_at, stock_quantity, quantity, is_admin 등에 적절한 기본값 설정

## 데이터베이스 설계 특징 🎯

### 현재 구현의 특징

1. **간소화된 주문 시스템**:

   - Orders 테이블에 별도의 고객 정보 필드 없음
   - 주문자 정보는 profiles 테이블을 통해 참조
   - 주문 상태는 3단계만 관리 (pending → completed → cancelled)

2. **사용자 중심 설계**:

   - 모든 데이터가 profiles.id(uuid)를 통해 연결
   - Supabase Auth와 완전 통합된 사용자 관리

3. **실용적 제약 조건**:
   - 가격과 수량에 대한 엄격한 검증 (CHECK 제약)
   - 재고 부족 방지를 위한 stock_quantity >= 0 제약
   - RLS로 사용자별 데이터 격리

### 향후 확장 가능성

- 주문에 배송 정보가 필요한 경우 별도 테이블 추가 가능
- 주문 상태를 더 세분화하려면 CHECK 제약 수정 필요
- 상품 카테고리, 리뷰 등 추가 기능용 테이블 확장 가능

## MVP 핵심 기능 (2-3주 목표)

## 1. 상품 관리 시스템 (우선순위 1) ✅ 완료

### 1.1 상품 카탈로그 (고객용) ✅ 완료

**목표**: 기본적인 상품 조회 기능

**필수 작업**:

- [x] 홈페이지 상품 목록 표시 (그리드 형태)
- [x] 상품 카드 컴포넌트 (이미지, 이름, 가격, 재고)
- [x] 상품 서버 액션 (getProducts, getProduct)
- [x] 반응형 그리드 레이아웃 (1-4열)
- [x] 로딩 상태 및 에러 처리
- [x] 상품 이미지 최적화 (Next.js Image)
- [x] 상품 상세 페이지 구현 ✅ 완료
  - [x] 상품 이미지 표시
  - [x] 상품 정보 (이름, 설명, 가격, 재고)
  - [x] 수량 선택 기능
  - [x] 장바구니 담기 버튼
  - [x] SEO 최적화된 메타데이터
  - [x] 관련 상품 추천 섹션
  - [x] 반응형 레이아웃
  - [x] 뒤로가기 버튼

### 1.2 상품 관리 (관리자용) ✅ 완료

**목표**: 기본적인 상품 CRUD 기능

**필수 작업**:

- [x] 관리자 권한 체크 (is_admin 필드 활용)
- [x] 상품 생성 서버 액션 (createProduct)
- [x] 상품 수정 서버 액션 (updateProduct)
- [x] 상품 삭제 서버 액션 (deleteProduct)
- [x] Zod 스키마 유효성 검사
- [x] 상품 등록 폼 UI
  - [x] 이름, 설명, 가격, 재고 입력
  - [x] 이미지 URL 입력 (파일 업로드는 추후)
- [x] 상품 목록 조회 (관리자용)
- [x] 상품 수정/삭제 기능 UI
- [x] 관리자 대시보드 통계 (상품 수, 저재고 알림)

## 2. 장바구니 시스템 (우선순위 2) ✅ 완료

### 2.1 장바구니 기능 ✅ 완료

**목표**: 기본적인 장바구니 담기/빼기 기능

**필수 작업**:

- [x] 장바구니 서버 액션 구현 ✅ 완료
  - [x] addToCart (상품 추가)
  - [x] getCartItems (목록 조회)
  - [x] updateCartItemQuantity (수량 변경)
  - [x] removeFromCart (아이템 삭제)
  - [x] clearCart (장바구니 비우기)
- [x] 장바구니 담기 기능 ✅ 완료
  - [x] 상품 상세페이지에서 장바구니 추가
  - [x] 중복 상품 수량 증가 처리
  - [x] 재고 확인 및 검증
- [x] 장바구니 페이지 구현 ✅ 완료
  - [x] 장바구니 페이지 레이아웃 (/cart)
  - [x] 장바구니 컨테이너 컴포넌트
  - [x] 장바구니 아이템 목록 컴포넌트
  - [x] 개별 아이템 카드 컴포넌트
  - [x] 수량 변경 기능 (+, - 버튼)
  - [x] 개별 상품 삭제
  - [x] 총 금액 계산 및 표시
  - [x] 체크아웃 버튼
- [x] 헤더 장바구니 아이콘 ✅ 완료
  - [x] 장바구니 아이템 수 표시
  - [x] 장바구니 페이지로 이동 링크
  - [x] TanStack Query를 활용한 실시간 동기화

## 3. 주문 시스템 (우선순위 3) ✅ 완료

### 3.1 기본 주문 프로세스 ✅ 완료

**목표**: 간단한 주문 생성 및 완료

**필수 작업**:

- [x] 주문서 작성 페이지 (/checkout)
  - [x] 주문 상품 목록 확인
  - [x] 총 주문 금액 표시
  - [x] 간단한 주문 확인 (고객 정보는 프로필에서 가져옴)
  - [x] 주문 완료 버튼
  - [x] React Hook Form + Zod 유효성 검사
- [x] 주문 생성 로직
  - [x] Orders 테이블에 주문 정보 저장 (user_id, status, total_amount)
  - [x] Order_items 테이블에 주문 상품 저장
  - [x] 재고 차감 처리
  - [x] 장바구니 비우기
  - [x] 트랜잭션 처리로 데이터 일관성 보장
- [x] 주문 완료 페이지 (/order-success/[id])
  - [x] 주문 번호 표시
  - [x] 주문 내용 확인
  - [x] 주문 상태 표시 (pending, completed, cancelled)
  - [x] 배송 예정일 안내
  - [x] 관련 링크 제공 (주문 내역, 홈으로)

### 3.2 주문 내역 조회 ✅ 완료

**목표**: 기본적인 주문 내역 확인

**필수 작업**:

- [x] 마이페이지 주문 내역 (/orders)
  - [x] 사용자별 주문 목록 조회
  - [x] 주문 상태 표시 (pending, completed, cancelled)
  - [x] 주문 상세 정보 조회
  - [x] 페이지네이션 지원
  - [x] 주문 상품 목록 표시
- [x] 관리자 주문 관리 (/admin/orders)
  - [x] 전체 주문 목록 조회
  - [x] 주문 상태 변경 기능 (pending ↔ completed ↔ cancelled)
  - [x] 주문 상세 다이얼로그
  - [x] 주문 검색 및 필터링
  - [x] 사용자 정보 확인 (profiles 테이블 조인)

## 4. 사용자 인터페이스 (우선순위 4) ✅ 완료

### 4.1 기본 레이아웃 ✅ 완료

**목표**: 반응형 기본 UI 구성

**필수 작업**:

- [x] 헤더 컴포넌트 (기존 Navbar 활용)
  - [x] 로고
  - [x] 네비게이션 (홈, 로그인/로그아웃)
  - [x] 모바일 반응형 메뉴
  - [x] 장바구니 아이콘 추가
  - [x] 관리자 메뉴 (관리자 권한시)
- [x] 홈페이지 레이아웃
  - [x] 히어로 섹션 (ShopMall 브랜딩)
  - [x] 상품 목록 섹션
- [x] 푸터 컴포넌트 (기본 정보만)

### 4.2 기본 페이지 구성 ✅ 완료

**필수 작업**:

- [x] 홈페이지 (`/`) ✅ 완료
- [x] 상품 상세 페이지 (`/products/[id]`) ✅ 완료
- [x] 장바구니 페이지 (`/cart`) ✅ 완료
- [x] 주문서 작성 페이지 (`/checkout`) ✅ 완료
- [x] 주문 완료 페이지 (`/order-success/[id]`) ✅ 완료
- [x] 마이페이지 주문 내역 (`/orders`) ✅ 완료
- [x] 관리자 대시보드 (`/admin`) ✅ 완료
- [x] 관리자 상품 관리 (`/admin/products`) ✅ 완료
- [x] 관리자 주문 관리 (`/admin/orders`) ✅ 완료
- [x] 관리자 상품 등록 (`/admin/products/new`) ✅ 완료

## 5. 인증 및 권한 ✅ 기본 완료

### 5.1 기존 인증 시스템 활용

- [x] 로그인/회원가입 (이미 구현됨)
- [x] 사용자 프로필 관리 (이미 구현됨)
- [x] 관리자 권한 체크 로직 (서버 액션에서 구현됨)

## 현재 진행 상황 📊

### ✅ 완료된 작업 (프로젝트 완료!)

1. **데이터베이스 구조 완성**

   - 모든 테이블 생성 및 관계 설정 완료
   - 샘플 데이터 추가 완료

2. **상품 관리 시스템 100% 완성**

   - 고객용 상품 조회 (홈페이지, 상품 상세)
   - 관리자용 상품 CRUD 전체 완성
   - 관리자 대시보드 및 통계 기능

3. **장바구니 시스템 100% 완성**

   - 모든 장바구니 서버 액션 구현
   - 장바구니 페이지 UI 완성
   - 실시간 동기화 및 헤더 아이콘 연동

4. **주문 시스템 100% 완성**

   - 체크아웃 프로세스 완전 구현
   - 주문 생성 및 재고 관리 로직
   - 주문 완료 및 내역 조회 시스템
   - 관리자 주문 관리 기능

5. **UI/UX 100% 완성**
   - 모든 페이지 반응형 구현
   - ShadcnUI 컴포넌트 활용
   - 로딩/에러 상태 처리
   - SEO 최적화

### 🎉 프로젝트 상태: MVP 완료!

**목표 기간**: 2-3주 → **실제 완료**: 1주

**구현된 페이지**:

- ✅ 홈페이지 (상품 목록)
- ✅ 상품 상세 페이지
- ✅ 장바구니 페이지
- ✅ 체크아웃 페이지
- ✅ 주문 완료 페이지
- ✅ 주문 내역 페이지
- ✅ 관리자 대시보드
- ✅ 관리자 상품 관리
- ✅ 관리자 주문 관리

## 간소화된 3주 로드맵

### Week 1: 상품 관리 시스템 ✅ 100% 완료

- [x] **Day 1-2**: 데이터베이스 테이블 확인 및 타입 정의
- [x] **Day 3-4**: 상품 기능 구현 (목록, 상세, CRUD)
- [x] **Day 5**: 상품 관리 UI 완성

### Week 2: 장바구니 및 주문 시스템 ✅ 100% 완료 (실제 1주 완료)

- [x] **Day 8-10**: 장바구니 기능 완성
- [x] **Day 11-14**: 주문 시스템 완성

### Week 3: 관리자 기능 및 최종 완성 ✅ 100% 완료 (실제 1주 완료)

- [x] **Day 15-17**: 관리자 기능 완성
- [x] **Day 18-21**: 전체 기능 테스트 및 완성

## 제외된 기능 (추후 구현 가능)

다음 기능들은 MVP에서 제외했으나 향후 추가 가능:

- ❌ 복잡한 검색 및 필터링 (카테고리별, 가격대별)
- ❌ 리뷰 및 평점 시스템
- ❌ 위시리스트 기능
- ❌ 실제 결제 시스템 연동 (현재는 주문서 작성만)
- ❌ 이메일 알림 (주문 확인, 배송 알림)
- ❌ 고급 분석 기능 (매출 통계, 고객 분석)
- ❌ 자동화된 테스트
- ❌ 파일 업로드 (현재는 이미지 URL 입력)

## 성공 기준 (3주 목표) ✅ 모두 달성!

### 기능적 목표

- [x] 상품 조회 및 관리 100% 완성 ✅
- [x] 장바구니 기능 100% 완성 ✅
- [x] 기본 주문 프로세스 100% 완성 ✅
- [x] 관리자 기능 100% 완성 ✅ (목표 80% 초과 달성)
- [x] 모바일 반응형 100% 완성 ✅ (목표 90% 초과 달성)

### 기술적 목표

- [x] 모든 핵심 기능 정상 작동 ✅
- [x] 에러 없는 빌드 ✅
- [x] 기본적인 에러 핸들링 ✅
- [x] 데이터베이스 연동 완료 ✅

## 🎯 다음 단계 제안

MVP가 완성되었으므로 다음과 같은 개선 작업을 진행할 수 있습니다:

### 우선순위 1: 사용자 경험 개선

- 🔍 **상품 검색/필터**: 카테고리, 가격대, 인기순 정렬
- ⭐ **리뷰 시스템**: 상품 평점 및 후기 기능
- 💝 **위시리스트**: 찜 목록 기능

### 우선순위 2: 비즈니스 기능 강화

- 💳 **실제 결제 연동**: 토스페이먼츠, 카카오페이 등
- 🏷️ **할인/쿠폰**: 프로모션 시스템
- 📧 **알림 시스템**: 이메일, SMS 알림

### 우선순위 3: 운영 효율성

- 📊 **고급 분석**: 매출 통계, 인기 상품 분석
- 🚚 **배송 추적**: 실시간 배송 상태 관리
- 🤖 **자동화**: 재고 알림, 자동 발주

**결론**: ShopMall MVP는 목표한 2-3주보다 빠른 1주 만에 완성되었으며, 모든 핵심 E-commerce 기능을 포함한 완전한 온라인 쇼핑몰로 구현되었습니다! 🎉
