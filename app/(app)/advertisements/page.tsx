import { PageHeader } from "@/components/shared/page-header";
import { ChannelStatusGrid } from "@/features/advertisements/components/channel-status-grid";
import { CopyTemplateStudio } from "@/features/advertisements/components/copy-template-studio";

export default function AdvertisementsPage() {
  return <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="광고 관리" description="채널별 게시 상태를 확인하고 채널에 맞는 광고 문구 템플릿을 준비합니다." /><ChannelStatusGrid /><div className="mt-6"><CopyTemplateStudio /></div></main>;
}
