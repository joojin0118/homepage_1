-- 새 사용자 가입 시 프로필 자동 생성 함수
-- 이 함수는 새 사용자가 가입할 때 자동으로 profiles 테이블에 해당 사용자의 기본 프로필을 생성합니다.
create or replace function public.handle_new_user()
returns trigger as $$ -- 트리거 함수임을 선언, 달러 기호는 함수 본문의 시작과 끝을 나타냅니다.
begin
  -- 새 사용자가 가입하면, 해당 사용자의 ID와 이름을 가져와 profiles 테이블에 새 행을 추가합니다.
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name'); 
  -- new는 방금 생성된 사용자 데이터를 가리킵니다.
  -- new.id는 새 사용자의 ID입니다.
  -- new.raw_user_meta_data->>'name'은 회원가입 시 입력한 사용자 이름을 JSON 데이터에서 추출합니다.
  return new; -- 트리거가 성공적으로 실행되었음을 알리고, 원래 작업(사용자 생성)을 계속 진행합니다.
end;
$$ language plpgsql security definer; 
-- language plpgsql: 함수가 PostgreSQL 절차적 언어로 작성되었음을 나타냅니다.
-- security definer: 이 함수가 함수를 생성한 사용자(일반적으로 관리자)의 권한으로 실행됨을 의미합니다.
-- 이는 일반 사용자가 profiles 테이블에 직접 접근할 수 없더라도, 회원가입은 정상적으로 처리됨을 보장합니다.

-- 새 사용자 가입 트리거
-- 이 트리거는 auth.users 테이블에 새 사용자가 추가될 때마다 자동으로 위에서 정의한 함수를 실행합니다.
create trigger on_auth_user_created
  after insert on auth.users -- 'insert' 작업이 auth.users 테이블에서 완료된 '후에' 트리거가 실행됨을 지정합니다.
  for each row -- 테이블에 추가되는 각 행(사용자)마다 트리거가 한 번씩 실행됩니다.
  execute procedure public.handle_new_user(); -- 실행할 함수를 지정합니다.