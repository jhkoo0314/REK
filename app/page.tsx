import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">개발 환경 준비 완료</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          배방우리부동산 매물관리
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          로그인과 매물 관리 화면을 연결하기 위한 기본 프로젝트를 준비하고 있습니다.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                로그인
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700">
                회원가입
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              href="/dashboard"
            >
              대시보드 열기
            </Link>
            <UserButton />
          </Show>
        </div>
      </section>
    </main>
  );
}
