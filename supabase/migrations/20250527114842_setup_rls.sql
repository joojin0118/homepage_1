-- RLS(Row Level Security) 활성화
-- RLS는 데이터베이스 수준에서 행 단위로 보안을 적용하는 기능입니다.
-- 이것을 활성화하면 특정 조건을 만족할 때만 데이터에 접근할 수 있습니다.
alter table profiles enable row level security; -- 프로필 테이블에 RLS 활성화
alter table products enable row level security; -- 상품 테이블에 RLS 활성화
alter table cart_items enable row level security; -- 장바구니 테이블에 RLS 활성화
alter table orders enable row level security; -- 주문 테이블에 RLS 활성화
alter table order_items enable row level security; -- 주문 상품 테이블에 RLS 활성화

-- 프로필 정책: 사용자가 자신의 프로필만 접근할 수 있도록 설정
create policy "Users can view their own profile" -- 사용자가 자신의 프로필을 조회할 수 있음
  on profiles for select -- profiles 테이블에서 SELECT(조회) 작업에 대한 정책
  using (auth.uid() = id); -- auth.uid()는 현재 로그인한 사용자의 ID, 이 ID가 profiles.id와 일치해야만 조회 가능

create policy "Users can update their own profile" -- 사용자가 자신의 프로필을 수정할 수 있음
  on profiles for update -- UPDATE(수정) 작업에 대한 정책
  using (auth.uid() = id); -- 현재 로그인한 사용자의 ID와 일치하는 프로필만 수정 가능

create policy "Users can insert their profile on signup" -- 회원가입 시 프로필 생성 허용
  on profiles for insert -- INSERT(생성) 작업에 대한 정책
  with check (auth.uid() = id); -- 자신의 ID로만 프로필 생성 가능

-- 상품 정책: 누구나 상품을 볼 수 있지만, 관리자만 추가/수정/삭제할 수 있음
create policy "Anyone can view products" -- 모든 사용자가 상품을 볼 수 있음
  on products for select -- 상품 테이블 조회 정책
  to authenticated, anon -- 인증된 사용자와 익명 사용자 모두에게 적용
  using (true); -- 항상 true, 즉 모든 상품을 볼 수 있음

create policy "Admins can insert products" -- 관리자만 상품을 추가할 수 있음
  on products for insert -- 상품 추가 정책
  to authenticated -- 인증된 사용자만 가능
  with check (
    exists ( -- 하위 쿼리가 하나 이상의 행을 반환하면 true
      select 1 from profiles
      where profiles.id = auth.uid() -- 현재 로그인한 사용자의 프로필을 찾고
      and profiles.is_admin = true -- 그 사용자가 관리자인지 확인
    )
  );

create policy "Admins can update products" -- 관리자만 상품을 수정할 수 있음
  on products for update -- 상품 수정 정책
  to authenticated -- 인증된 사용자만 가능
  using ( -- 위와 동일한 관리자 확인 로직
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

create policy "Admins can delete products" -- 관리자만 상품을 삭제할 수 있음
  on products for delete -- 상품 삭제 정책
  to authenticated -- 인증된 사용자만 가능
  using ( -- 위와 동일한 관리자 확인 로직
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- 장바구니 정책: 사용자는 자신의 장바구니만 접근 가능
create policy "Users can view their own cart items" -- 사용자가 자신의 장바구니만 볼 수 있음
  on cart_items for select -- 장바구니 조회 정책
  to authenticated -- 인증된 사용자만 가능
  using (auth.uid() = user_id); -- 현재 로그인한 사용자의 장바구니만 조회 가능

create policy "Users can insert into their own cart" -- 사용자가 자신의 장바구니에만 상품 추가 가능
  on cart_items for insert -- 장바구니 추가 정책
  to authenticated -- 인증된 사용자만 가능
  with check (auth.uid() = user_id); -- 자신의 ID로만 장바구니에 추가 가능

create policy "Users can update their own cart items" -- 사용자가 자신의 장바구니만 수정 가능
  on cart_items for update -- 장바구니 수정 정책
  to authenticated -- 인증된 사용자만 가능
  using (auth.uid() = user_id); -- 자신의 장바구니만 수정 가능

create policy "Users can delete their own cart items" -- 사용자가 자신의 장바구니에서만 상품 삭제 가능
  on cart_items for delete -- 장바구니 삭제 정책
  to authenticated -- 인증된 사용자만 가능
  using (auth.uid() = user_id); -- 자신의 장바구니만 삭제 가능

-- 주문 정책: 사용자는 자신의 주문만 조회/생성 가능, 관리자만 주문 상태 변경 가능
create policy "Users can view their own orders" -- 사용자가 자신의 주문만 볼 수 있음
  on orders for select -- 주문 조회 정책
  to authenticated -- 인증된 사용자만 가능
  using (auth.uid() = user_id); -- 자신의 주문만 조회 가능

create policy "Users can create their own orders" -- 사용자가 자신의 주문만 생성 가능
  on orders for insert -- 주문 생성 정책
  to authenticated -- 인증된 사용자만 가능
  with check (auth.uid() = user_id); -- 자신의 ID로만 주문 생성 가능

create policy "Admins can update orders" -- 관리자만 주문 상태 변경 가능(예: 배송 처리)
  on orders for update -- 주문 수정 정책
  to authenticated -- 인증된 사용자만 가능
  using ( -- 관리자인지 확인하는 로직
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- 주문 항목 정책: 더 복잡한 관계 검사를 통한 접근 제어
create policy "Users can view their own order items" -- 사용자가 자신의 주문 상품만 볼 수 있음
  on order_items for select -- 주문 상품 조회 정책
  to authenticated -- 인증된 사용자만 가능
  using (
    exists ( -- 더 복잡한 관계 검사: 주문 테이블을 통해 소유권 확인
      select 1 from orders
      where orders.id = order_items.order_id -- 주문 항목과 주문을 연결하고
      and orders.user_id = auth.uid() -- 그 주문이 현재 사용자의 것인지 확인
    )
  );

create policy "Users can insert their own order items" -- 사용자가 자신의 주문에만 상품 추가 가능
  on order_items for insert -- 주문 상품 추가 정책
  to authenticated -- 인증된 사용자만 가능
  with check (
    exists ( -- 위와 비슷한 관계 검사
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can update order items" -- 관리자만 주문 상품 정보 수정 가능
  on order_items for update -- 주문 상품 수정 정책
  to authenticated -- 인증된 사용자만 가능
  using (
    exists ( -- 관리자인지 확인하는 로직
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );