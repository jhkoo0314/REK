export function WorkspaceEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#f3e4dc] font-mono text-sm font-bold text-[#a85f43]">h</div>
      <h2 className="mt-4 text-base font-extrabold tracking-[-0.04em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p>
      <p className="mt-5 text-xs font-semibold text-[#7b7470]">현재는 로그인·공통 화면 단계입니다.</p>
    </section>
  );
}
