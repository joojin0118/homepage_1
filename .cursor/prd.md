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
- id: string (Primary Key, Auth User ID)
- name: string (사용자 이름)
- is_admin: boolean (관리자 권한)
- created_at: timestamp
```

### 2. Products (상품) ✅ 생성 완료
```sql
- id: number (Primary Key)
- name: string (상품명)
- description: string (상품 설명)
- price: number (가격)
- stock_quantity: number (재고 수량)
- image_url: string (상품 이미지 URL)
- created_by: string (FK to profiles.id)
- created_at: timestamp
```

### 3. Cart Items (장바구니) ✅ 생성 완료
```sql
- id: number (Primary Key)
- user_id: string (FK to profiles.id)
- product_id: number (FK to products.id)
- quantity: number (수량)
- created_at: timestamp
```

### 4. Orders (주문) ✅ 생성 완료
```sql
- id: number (Primary Key)
- user_id: string (FK to profiles.id)
- status: string (주문 상태: pending, completed, cancelled)
- total_amount: number (총 주문 금액)
- created_at: timestamp
```

### 5. Order Items (주문 상품) ✅ 생성 완료
```sql
- id: number (Primary Key)
- order_id: number (FK to orders.id)
- product_id: number (FK to products.id)
- quantity: number (수량)
- price_at_time: number (주문 시점 가격)
- created_at: timestamp
```

## MVP 핵심 기능 (2-3주 목표)

## 1. 상품 관리 시스템 (우선순위 1) 🚧 진행 중

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
  - [x] 장바구니 담기 버튼 (임시 구현)
  - [x] SEO 최적화된 메타데이터
  - [x] 관련 상품 추천 섹션
  - [x] 반응형 레이아웃

### 1.2 상품 관리 (관리자용) ✅ 서버 액션 완료
**목표**: 기본적인 상품 CRUD 기능

**필수 작업**:
- [x] 관리자 권한 체크 (is_admin 필드 활용)
- [x] 상품 생성 서버 액션 (createProduct)
- [x] 상품 수정 서버 액션 (updateProduct)  
- [x] 상품 삭제 서버 액션 (deleteProduct)
- [x] Zod 스키마 유효성 검사
- [ ] 상품 등록 폼 UI
  - [ ] 이름, 설명, 가격, 재고 입력
  - [ ] 이미지 URL 입력 (파일 업로드는 추후)
- [ ] 상품 목록 조회 (관리자용)
- [ ] 상품 수정/삭제 기능 UI

## 2. 장바구니 시스템 (우선순위 2) 🚧 진행 중

### 2.1 장바구니 기능 ✅ 서버 액션 완료, 🚧 UI 진행 중
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
- [x] 장바구니 페이지 구현 🚧 진행 중
  - [x] 장바구니 페이지 레이아웃 (/cart)
  - [x] 장바구니 컨테이너 컴포넌트
  - [x] 장바구니 아이템 목록 컴포넌트
  - [ ] 개별 아이템 카드 컴포넌트 📝 다음 작업
  - [ ] 수량 변경 기능 (+, - 버튼)
  - [ ] 개별 상품 삭제
  - [ ] 총 금액 계산 및 표시
- [ ] 헤더 장바구니 아이콘
  - [ ] 장바구니 아이템 수 표시
  - [ ] 장바구니 페이지로 이동 링크

## 3. 주문 시스템 (우선순위 3) ⏳ 대기

### 3.1 기본 주문 프로세스
**목표**: 간단한 주문 생성 및 완료

**필수 작업**:
- [ ] 주문서 작성 페이지
  - [ ] 주문 상품 목록 확인
  - [ ] 총 주문 금액 표시
  - [ ] 주문자 정보 입력 (이름, 연락처, 주소)
  - [ ] 주문 완료 버튼
- [ ] 주문 생성 로직
  - [ ] Orders 테이블에 주문 정보 저장
  - [ ] Order_items 테이블에 주문 상품 저장
  - [ ] 재고 차감 처리
  - [ ] 장바구니 비우기
- [ ] 주문 완료 페이지
  - [ ] 주문 번호 표시
  - [ ] 주문 내용 확인

### 3.2 주문 내역 조회
**목표**: 기본적인 주문 내역 확인

**필수 작업**:
- [ ] 마이페이지 주문 내역
  - [ ] 사용자별 주문 목록 조회
  - [ ] 주문 상태 표시 (pending, completed, cancelled)
  - [ ] 주문 상세 정보 조회
- [ ] 관리자 주문 관리
  - [ ] 전체 주문 목록 조회
  - [ ] 주문 상태 변경 기능

## 4. 사용자 인터페이스 (우선순위 4) 🚧 부분 완료

### 4.1 기본 레이아웃 ✅ 부분 완료
**목표**: 반응형 기본 UI 구성

**필수 작업**:
- [x] 헤더 컴포넌트 (기존 Navbar 활용)
  - [x] 로고
  - [x] 네비게이션 (홈, 로그인/로그아웃)
  - [x] 모바일 반응형 메뉴
  - [ ] 장바구니 아이콘 추가
- [x] 홈페이지 레이아웃
  - [x] 히어로 섹션 (ShopMall 브랜딩)
  - [x] 상품 목록 섹션
- [ ] 푸터 컴포넌트 (기본 정보만)

### 4.2 기본 페이지 구성 🚧 진행 중
**필수 작업**:
- [x] 홈페이지 (`/`) ✅ 완료
- [ ] 상품 상세 페이지 (`/products/[id]`) 📝 다음 작업
- [ ] 장바구니 페이지 (`/cart`)
- [ ] 주문서 작성 페이지 (`/checkout`)
- [ ] 주문 완료 페이지 (`/order-success`)
- [ ] 마이페이지 (`/profile`) - 주문 내역만
- [ ] 관리자 페이지 (`/admin`) - 상품/주문 관리

## 5. 인증 및 권한 ✅ 기본 완료

### 5.1 기존 인증 시스템 활용
- [x] 로그인/회원가입 (이미 구현됨)
- [x] 사용자 프로필 관리 (이미 구현됨)
- [x] 관리자 권한 체크 로직 (서버 액션에서 구현됨)

## 현재 진행 상황 📊

### ✅ 완료된 작업 (Week 1, Day 1-4)
1. **데이터베이스 구조 확인 및 샘플 데이터**
   - 모든 테이블이 이미 생성되어 있음
   - 6개 테스트 상품 데이터 추가 완료

2. **상품 서버 액션 구현**
   - `src/actions/products.ts` 완성
   - CRUD 모든 기능 구현 (조회, 생성, 수정, 삭제)
   - 관리자 권한 체크 및 유효성 검사 포함

3. **상품 UI 컴포넌트**
   - `ProductCard` 컴포넌트 완성
   - `ProductList` 컴포넌트 완성  
   - 반응형 그리드, 로딩/에러 상태 처리

4. **쇼핑몰 홈페이지**
   - 헤로 섹션 및 상품 목록 표시
   - 서버 사이드 렌더링으로 SEO 최적화
   - Next.js Image 최적화 설정

### 🚧 진행 중인 작업 (Week 1, Day 5)
- 상품 상세 페이지 구현 준비

### 📝 다음 작업 우선순위
1. **상품 상세 페이지** (`/products/[id]`)
2. **장바구니 서버 액션**
3. **장바구니 페이지 UI**

## 간소화된 3주 로드맵

### Week 1: 상품 관리 시스템 ✅ 80% 완료
**Day 1-2**: 데이터베이스 테이블 생성 및 타입 정의
- [x] Supabase에서 products, cart_items, orders, order_items 테이블 확인
- [x] TypeScript 타입 정의 활용

**Day 3-4**: 상품 기능 구현
- [x] 상품 목록 조회 API 및 UI
- [x] 상품 서버 액션 (CRUD) 완성
- [ ] 상품 상세 페이지 📝 진행 예정

**Day 5-7**: 상품 기능 완성 및 테스트
- [ ] 상품 상세 페이지 완성
- [ ] 관리자 상품 관리 UI
- [ ] 에러 핸들링 강화

### Week 2: 장바구니 및 주문 시스템
**Day 8-10**: 장바구니 기능
- [ ] 장바구니 추가/수정/삭제 API
- [ ] 장바구니 페이지 UI
- [ ] 헤더 장바구니 연동

**Day 11-14**: 주문 시스템
- [ ] 주문서 작성 페이지
- [ ] 주문 생성 로직
- [ ] 주문 완료 및 내역 조회

### Week 3: 관리자 기능 및 최종 완성
**Day 15-17**: 관리자 기능
- [ ] 관리자 대시보드
- [ ] 상품 관리 UI
- [ ] 주문 관리 기능

**Day 18-21**: 최종 완성 및 테스트
- [ ] 전체 기능 테스트
- [ ] 반응형 UI 완성
- [ ] 배포 준비

## 제외된 기능 (추후 구현)

다음 기능들은 MVP에서 제외하고 추후 개발:
- ❌ 복잡한 검색 및 필터링
- ❌ 리뷰 및 평점 시스템
- ❌ 위시리스트
- ❌ 결제 시스템 연동
- ❌ 이메일 알림
- ❌ 고급 분석 기능
- ❌ SEO 최적화
- ❌ 성능 최적화
- ❌ 자동화된 테스트


## 성공 기준 (3주 목표)

### 기능적 목표
- [ ] 상품 조회 및 관리 100% 완성
- [ ] 장바구니 기능 100% 완성
- [ ] 기본 주문 프로세스 100% 완성
- [ ] 관리자 기능 80% 완성
- [ ] 모바일 반응형 90% 완성

### 기술적 목표
- [ ] 모든 핵심 기능 정상 작동
- [ ] 에러 없는 빌드
- [ ] 기본적인 에러 핸들링
- [ ] 데이터베이스 연동 완료

이 간소화된 PRD는 실제로 2-3주 내에 완성 가능한 현실적인 목표로 설정했습니다. 복잡한 기능들은 모두 제거하고 쇼핑몰의 핵심 기능만 남겼습니다. 