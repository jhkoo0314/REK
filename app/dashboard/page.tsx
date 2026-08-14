import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">로그인 확인 완료</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          대시보드 준비 중
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          다음 단계에서 오늘 할 일과 매물 현황을 이 화면에 연결합니다.
        </p>
      </section>
    </main>
  );
}
