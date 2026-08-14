import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { listingRows } from "./listing-data";

export function ListingMobileCards() {
  return <div className="divide-y divide-slate-100 md:hidden">{listingRows.map((listing) => <article key={listing.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><Link href={`/listings/${listing.id}`} className="font-semibold text-slate-800">{listing.building} {listing.unit}</Link><p className="mt-1 text-xs text-slate-400">{listing.structure} · {listing.available}</p></div><StatusBadge label={listing.status} /></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs"><div><p className="text-slate-400">보증금 / 월세</p><p className="mt-1 font-mono font-semibold text-slate-700">{listing.price}</p></div><div><p className="text-slate-400">관리비</p><p className="mt-1 font-mono font-semibold text-slate-700">{listing.fee}</p></div></div><Link href={`/listings/${listing.id}`} className="mt-4 inline-flex text-xs font-semibold text-blue-700">매물 상세 보기 →</Link></article>)}</div>;
}
