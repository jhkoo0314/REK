import { Construction, Sparkles } from "lucide-react";

type FeatureComingSoonProps = {
  description: string;
  title: string;
};

export function FeatureComingSoon({ description, title }: FeatureComingSoonProps) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1560px] items-center px-5 py-8 sm:px-8 lg:px-10">
      <section className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Construction className="size-6" />
        </span>
        <p className="mt-8 text-sm font-semibold text-blue-600">디자인 빌드 진행 중</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-4 max-w-xl leading-7 text-slate-500">{description}</p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Sparkles className="size-4 text-blue-500" /> 승인된 화면 시안을 순서대로 적용하고 있습니다.
        </div>
      </section>
    </main>
  );
}
