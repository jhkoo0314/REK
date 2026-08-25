export function WorkspaceEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-xl border border-[#e5e1db] bg-white px-6 py-14 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#eeeae3] font-mono text-sm font-bold text-[#3e3a37]">h</div>
      <h2 className="mt-4 text-base font-extrabold tracking-[-0.04em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#77736e]">{description}</p>
      <p className="mt-5 text-xs font-semibold text-[#77736e]">현재는 로그인·공통 화면 단계입니다.</p>
    </section>
  );
}
