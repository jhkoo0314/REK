import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, TriangleAlert } from "lucide-react";

type MembershipAccessStateProps = {
  type: "not-member" | "lookup-error";
  clerkUserId?: string;
};

const content = {
  "not-member": {
    icon: ShieldAlert,
    title: "업무 화면 접근 권한이 없습니다",
    description: "현재 로그인한 계정이 활성 조직 멤버로 연결되지 않았습니다. 관리자에게 계정 연결을 요청해 주세요.",
  },
  "lookup-error": {
    icon: TriangleAlert,
    title: "조직 정보를 확인하지 못했습니다",
    description: "잠시 후 다시 시도해 주세요. 계속되면 관리자에게 Supabase Dev 연결 상태를 알려 주세요.",
  },
} as const;

export function MembershipAccessState({ type, clerkUserId }: MembershipAccessStateProps) {
  const item = content[type];
  const Icon = item.icon;

  const showDevelopmentUserId = process.env.NODE_ENV === "development" && clerkUserId;

  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Icon className="size-6" /></span><h1 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>{showDevelopmentUserId ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left"><p className="text-xs font-semibold text-amber-800">개발용 Clerk User ID</p><code className="mt-1 block break-all text-xs text-amber-950">{clerkUserId}</code><p className="mt-2 text-xs leading-5 text-amber-800">이 값을 Dev SQL 연결 파일의 빈 따옴표 안에 넣으세요. 이메일이나 로그인 아이디는 아닙니다.</p></div> : null}{type === "not-member" ? <SignOutButton><button type="button" className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">다른 계정으로 로그인</button></SignOutButton> : null}</section></main>;
}
