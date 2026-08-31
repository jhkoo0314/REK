import { PageHeader } from "@/components/shared/page-header";
import { SensitivePermissionsWorkspace } from "@/features/members/components/sensitive-permissions-workspace";
import { getStaffPermissions } from "@/features/members/server/sensitive-permissions";

export default async function MembersPage() {
  const { context, members, errorMessage, revenueRateAvailable } = await getStaffPermissions();
  if (context.kind !== "ready" || context.role !== "admin") return <><PageHeader title="멤버 권한" description="직원별 민감정보 열람을 관리합니다." /><p className="rounded-xl border border-[#e5e1db] bg-white px-5 py-10 text-center text-sm text-[#7b7470]">민감정보 권한 설정은 관리자만 할 수 있습니다.</p></>;
  return <><PageHeader title="멤버 권한" description="직원별로 민감정보와 기본 수수료 비율을 관리합니다." /><SensitivePermissionsWorkspace members={members} errorMessage={errorMessage} revenueRateAvailable={revenueRateAvailable} /></>;
}
