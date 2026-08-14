import { ListingActivityTabs } from "@/features/listings/components/listing-activity-tabs";
import { ListingDetailHeader } from "@/features/listings/components/listing-detail-header";
import { ListingPriceSummary } from "@/features/listings/components/listing-price-summary";
import { ListingSensitivePanel } from "@/features/listings/components/listing-sensitive-panel";

export default function ListingDetailPage() {
  return <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><ListingDetailHeader /><section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]"><ListingPriceSummary /><ListingSensitivePanel /></section><div className="mt-6"><ListingActivityTabs /></div></main>;
}
