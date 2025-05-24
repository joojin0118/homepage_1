# Next.js + Supabase 보일러플레이트

최신 Next.js와 Supabase를 활용한 풀스택 개발을 위한 보일러플레이트입니다.

## 주요 기능

- 🔐 **Supabase Auth**: 이메일/비밀번호 인증 및 OAuth 지원
- 💾 **Supabase Storage**: 파일 업로드 및 관리
- 🏗️ **Next.js 앱 라우터**: 최신 Next.js 앱 라우터 구조 사용
- 🎨 **ShadcnUI + TailwindCSS**: 현대적이고 커스터마이징 가능한 UI 컴포넌트
- 🌓 **다크 모드**: 사용자 선호에 따른 테마 전환 지원
- 📱 **반응형 디자인**: 모바일부터 데스크탑까지 최적화된 UI
- 🔍 **SEO 최적화**: 메타데이터, 구조화된 데이터, sitemap.xml, robots.txt 자동 생성
- 📝 **서버 액션**: Next.js 서버 액션을 활용한 폼 처리 및 파일 업로드
- 🔒 **보호된 라우트**: 인증 상태에 따른 라우트 보호 구현

## 기술 스택

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) (Auth, Storage)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)

## 시작하기

### 사전 요구사항

- Node.js 18.17.0 이상
- pnpm 8.0.0 이상
- Supabase 프로젝트 (Auth 및 Storage 활성화)

### 설치

1. 저장소 클론

```bash
git clone https://github.com/your-username/boilerplate.git my-project
cd my-project
```

2. 의존성 설치

```bash
pnpm install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env` 파일로 복사하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

`.env` 파일에 다음과 같이 환경 변수를 설정합니다:

```
NEXT_PUBLIC_SUPABASE_URL="https://project_id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
NEXT_PUBLIC_STORAGE_BUCKET="your_storage_bucket_name" # 스토리지 버킷 이름

NEXT_PUBLIC_SITE_URL="http://localhost:3000" # 개발 환경 또는 배포 URL

SUPABASE_SERVICE_ROLE="your_supabase_service_role"
SUPABASE_DB_PASSWORD="your_supabase_db_password"

```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `NEXT_PUBLIC_STORAGE_BUCKET`: Supabase 스토리지 버킷 이름 (예: `test-bucket`)
- `NEXT_PUBLIC_SITE_URL`: 배포할 사이트 URL (개발 시 `http://localhost:3000`)
- `SUPABASE_SERVICE_ROLE`: Supabase 서비스 롤 키 (관리자 권한)
- `SUPABASE_DB_PASSWORD`: Supabase 데이터베이스 비밀번호

### MCP(Model Context Protocol) 설정

이 프로젝트는 AI 기반 개발 도구를 위한 MCP 서버 설정을 포함하고 있습니다. `.cursor/mcp.json` 파일에서 설정을 확인할 수 있습니다:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-sequential-thinking"]
    },
    "context7": {
      "command": "bunx",
      "args": ["@upstash/context7-mcp"]
    },
    "supabase": {
      "command": "bunx",
      "args": [
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "your_supabase_access_token" // 실제 Supabase 액세스 토큰으로 변경
      ]
    }
  }
}
```

Supabase MCP 서버를 사용하려면 `your_supabase_access_token`을 실제 액세스 토큰으로 변경해야 합니다.

### 개발 서버 실행

```bash
pnpm dev
```

이제 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com/)에 로그인하고 새 프로젝트를 생성합니다.
2. 프로젝트 생성 후 프로젝트 설정에서 API URL과 익명 키를 찾아 `.env` 파일에 설정합니다.

### 2. 인증 설정

1. Supabase 대시보드에서 Authentication > Settings로 이동합니다.
2. Site URL을 설정합니다 (배포된 URL 또는 개발 환경에서는 `http://localhost:3000`).
3. OAuth 제공업체를 설정하려면 Authentication > Providers로 이동하여 원하는 제공업체를 활성화합니다.
4. Redirect URLs에 `{SITE_URL}/auth/callback`을 추가합니다.

### 3. 스토리지 설정

1. Supabase 대시보드에서 Storage로 이동합니다.
2. "Create a new bucket"을 클릭하여 새 버킷을 생성합니다.
3. 버킷 이름을 `.env` 파일의 `NEXT_PUBLIC_STORAGE_BUCKET`에 설정한 이름과 동일하게 지정합니다 (예: `test-bucket`).
4. **Public access**를 활성화합니다. (이 보일러플레이트는 공개 버킷을 기준으로 작성되었습니다.)
5. (선택 사항) 스토리지 정책(Policies)을 설정하여 파일 접근 권한을 세밀하게 제어할 수 있습니다. 기본적으로 공개 버킷은 모든 사용자가 파일을 읽을 수 있습니다. 파일 업로드 및 삭제는 보일러플레이트의 서버 액션을 통해 처리됩니다.

## 프로젝트 구조

```
src/
├── actions/                # Next.js 서버 액션 (auth.ts, storage.ts)
├── app/                    # Next.js 앱 라우터
│   ├── auth/               # 인증 관련 라우트 (callback, error)
│   ├── login/              # 로그인 페이지 (layout.tsx, page.tsx)
│   ├── profile/            # 프로필 페이지 (layout.tsx, page.tsx)
│   ├── globals.css         # 전역 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈페이지 (파일 업로드/리스트)
│   ├── favicon.ico         # 파비콘
│   ├── manifest.ts         # PWA 매니페스트
│   ├── not-found.tsx       # 404 페이지
│   ├── robots.ts           # robots.txt 생성
│   └── sitemap.ts          # sitemap.xml 생성
├── components/             # 재사용 가능한 컴포넌트
│   ├── auth/               # 인증 UI 컴포넌트 (buttons.tsx 등)
│   ├── nav/                # 네비게이션 컴포넌트 (navbar.tsx 등)
│   ├── seo/                # SEO 관련 컴포넌트 (JsonLd.tsx)
│   └── ui/                 # Shadcn UI 컴포넌트 (button.tsx, input.tsx 등)
├── hooks/                  # 커스텀 훅 (use-mobile.ts)
├── lib/                    # 라이브러리 유틸리티 (utils.ts - Shadcn)
├── middleware.ts           # Next.js 미들웨어 (라우트 보호)
├── types/                  # TypeScript 타입 정의 (schema.ts)
└── utils/                  # 유틸리티 함수
    ├── seo/                # SEO 유틸리티 (constants.ts, metadata.ts)
    └── supabase/           # Supabase 클라이언트 (client.ts, server.ts, middleware.ts, storage.ts)
```

## 주요 기능 사용법

### 라우트 보호

`src/middleware.ts`와 `src/utils/supabase/middleware.ts` 파일에서 라우트 보호 설정을 확인할 수 있습니다. 기본적으로 `/profile` 경로는 인증된 사용자만 접근할 수 있습니다.

특정 경로에 인증이 필요하도록 설정하려면 `src/utils/supabase/middleware.ts` 파일의 `protectedRoutes` 배열을 수정하세요.

### 인증 컴포넌트

로그인 및 회원가입 기능은 `src/app/login/page.tsx`에 구현되어 있습니다. 이 페이지는 서버 액션(`src/actions/auth.ts`)을 사용하여 인증 로직을 처리합니다.

### 파일 업로드 및 관리

파일 업로드 및 목록 표시는 홈페이지(`src/app/page.tsx`)에서 처리됩니다.

- `src/components/ui/file-uploader.tsx` (제거됨, `src/app/page.tsx`에 통합될 수 있음)
- `src/components/ui/file-list.tsx` (제거됨, `src/app/page.tsx`에 통합될 수 있음)
- 파일 업로드는 `src/actions/storage.ts` 서버 액션을 사용합니다.
- Supabase Storage 유틸리티는 `src/utils/supabase/storage.ts`에 있습니다.

### SEO 최적화

`src/utils/seo` 디렉토리의 유틸리티 함수를 사용하여 페이지별 메타데이터를 설정할 수 있습니다.

```typescript
// 페이지 메타데이터 설정 예시
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "페이지 제목",
  description: "페이지 설명",
  noIndex: false, // 검색 엔진 색인 여부
});
```

## Vercel 배포

이 프로젝트는 [Vercel](https://vercel.com/)에 쉽게 배포할 수 있습니다.

1. GitHub 저장소를 Vercel에 연결합니다.
2. 환경 변수를 설정합니다. (`.env` 파일 내용 참고)
3. 배포를 시작합니다.
