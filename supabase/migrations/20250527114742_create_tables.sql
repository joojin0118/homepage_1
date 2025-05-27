-- 사용자 프로필 테이블: 사용자의 기본 정보를 저장합니다.
create table profiles (
  id uuid primary key references auth.users(id), -- 사용자 ID, Supabase Auth의 사용자 계정과 연결됩니다.
  created_at timestamptz default now(), -- 프로필 생성 시간, 자동으로 현재 시간이 설정됩니다.
  name text, -- 사용자의 이름
  is_admin boolean default false -- 관리자 권한 여부, 기본값은 일반 사용자(false)입니다.
);

-- 상품 테이블: 쇼핑몰에서 판매하는 모든 상품 정보를 저장합니다.
create table products (
  id bigserial primary key, -- 상품 ID, 자동으로 증가하는 고유 식별자입니다.
  created_at timestamptz default now(), -- 상품 등록 시간, 자동으로 현재 시간이 설정됩니다.
  name text not null, -- 상품명, 필수 입력 항목입니다.
  description text, -- 상품 설명
  price numeric not null check (price > 0), -- 상품 가격, 0보다 커야 합니다.
  image_url text, -- 상품 이미지 URL
  created_by uuid references profiles(id) on delete set null on update cascade, -- 상품을 등록한 관리자의 ID (관리자 프로필 삭제 시 이 필드는 NULL로 설정)
  stock_quantity integer not null default 0 check (stock_quantity >= 0) -- 상품 재고 수량, 0 이상이어야 하며 기본값은 0입니다.
);

-- 장바구니 테이블: 사용자가 장바구니에 담은 상품 정보를 저장합니다.
create table cart_items (
  id bigserial primary key, -- 장바구니 항목 ID, 자동으로 증가하는 고유 식별자입니다.
  created_at timestamptz default now(), -- 항목이 장바구니에 추가된 시간
  user_id uuid references profiles(id) on delete cascade on update cascade, -- 장바구니 소유자(사용자) ID (프로필 삭제 시 장바구니 항목도 함께 삭제)
  product_id bigint references products(id) on delete cascade on update cascade, -- 장바구니에 담긴 상품 ID (상품 삭제 시 장바구니 항목도 함께 삭제)
  quantity integer default 1 check (quantity > 0), -- 상품 수량, 최소 1개 이상이어야 합니다.
  constraint unique_user_product unique(user_id, product_id) -- 같은 사용자가 같은 상품을 중복해서 담을 수 없게 합니다.
);

-- 주문 테이블: 사용자의 주문 정보를 저장합니다.
create table orders (
  id bigserial primary key, -- 주문 ID, 자동으로 증가하는 고유 식별자입니다.
  created_at timestamptz default now(), -- 주문 생성 시간
  user_id uuid references profiles(id) on delete restrict on update cascade not null, -- 주문한 사용자 ID, 필수. (사용자 프로필 삭제 시, 해당 사용자의 주문이 있으면 삭제 제한)
  status text not null check (status in ('pending', 'completed', 'cancelled')), -- 주문 상태(대기중, 완료, 취소)
  total_amount numeric not null -- 주문 총액
);

-- 주문 상품 테이블: 각 주문에 포함된 상품 상세 정보를 저장합니다.
create table order_items (
  id bigserial primary key, -- 주문 상품 ID, 자동으로 증가하는 고유 식별자입니다.
  created_at timestamptz default now(), -- 주문 상품 생성 시간
  order_id bigint references orders(id) on delete cascade on update cascade not null, -- 연결된 주문 ID (주문 삭제 시 주문 상품도 함께 삭제)
  product_id bigint references products(id) on delete restrict on update cascade not null, -- 주문한 상품 ID (상품 삭제 시, 해당 상품이 포함된 주문 상품이 있으면 삭제 제한)
  quantity integer not null check (quantity > 0), -- 주문 수량, 최소 1개 이상이어야 합니다.
  price_at_time numeric not null check (price_at_time >= 0) -- 주문 당시의 상품 가격 (가격이 0 이상이어야 함)
);