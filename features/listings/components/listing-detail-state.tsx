import Link from "next/link";

export function ListingDetailState({ title, description }: { title: string; description: string }) {
  return <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#f3e4dc] font-mono text-sm font-bold text-[#a85f43]">!</div><h2 className="mt-4 text-base font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p><Link className="mt-5 inline-block text-xs font-bold underline underline-offset-4" href="/listings">매물 목록으로 돌아가기</Link></section>;
}
