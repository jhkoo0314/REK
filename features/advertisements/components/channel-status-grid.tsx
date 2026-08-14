import { channels } from "./advertisement-data";

export function ChannelStatusGrid() {
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{channels.map((channel) => <article key={channel.name} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"><div><p className="text-sm font-medium text-slate-500">{channel.name}</p><p className="mt-2 text-lg font-bold tracking-tight text-slate-900">{channel.count}</p></div><span className={`size-3 rounded-full ring-4 ${channel.tone}`} /></article>)}</section>;
}
