import { createClient } from "@supabase/supabase-js";

function getSupabaseSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase 개발 연결 정보가 없습니다. .env.local에 공개 URL과 Publishable Key를 설정해 주세요.",
    );
  }

  return { url, publishableKey };
}

/**
 * 브라우저에서 사용할 Supabase 클라이언트입니다.
 * 일반 업무 데이터 접근은 향후 로그인 사용자 권한과 RLS를 통과해야 합니다.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = getSupabaseSettings();

  return createClient(url, publishableKey);
}
