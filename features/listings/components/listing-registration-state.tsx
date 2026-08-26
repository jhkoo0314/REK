export function ListingRegistrationState({ title, description }: { title: string; description: string }) {
  return <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#fff0ec] font-mono text-sm font-bold text-[#b94a42]">!</div><h2 className="mt-4 text-base font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p></section>;
}
