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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        // Supabase Storage 경로 패턴 (필요시 더 세분화 가능)
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
