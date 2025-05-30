import type { NextConfig } from "next";

// 환경변수에서 Supabase URL의 호스트네임 추출
function getSupabaseHostname() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "환경변수 NEXT_PUBLIC_SUPABASE_URL이 설정되어 있지 않습니다. .env 파일을 확인하세요.",
    );
  }
  try {
    return new URL(url).hostname;
  } catch {
    // URL 파싱 실패 시 기본값
    return "supabase.co";
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  // ESLint 설정 - 빌드 시 경고를 무시
  eslint: {
    // WARNING: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Next.js 15에서 serverExternalPackages로 이동
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],

  // Experimental 설정 (추가적인 호환성을 위해)
  experimental: {
    // Server Actions 관련 설정
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // webpack 설정 개선
  webpack: (config, { isServer, nextRuntime }) => {
    // Edge Runtime(미들웨어)에서는 Node.js API 사용 불가
    if (nextRuntime === "edge") {
      // Edge Runtime에서는 Node.js 전용 패키지를 externals에서 제외
      return config;
    }

    if (isServer) {
      // 서버에서 Supabase 관련 모듈 외부화
      const externals = ["@supabase/supabase-js", "@supabase/ssr"];

      if (Array.isArray(config.externals)) {
        config.externals.push(...externals);
      } else if (typeof config.externals === "function") {
        const originalExternals = config.externals;
        config.externals = async (params) => {
          const result = await originalExternals(params);
          if (externals.includes(params.request)) {
            return params.request;
          }
          return result;
        };
      } else {
        config.externals = externals;
      }
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        // Supabase Storage 경로 패턴 (필요시 더 세분화 가능)
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        // Unsplash 이미지 허용
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
