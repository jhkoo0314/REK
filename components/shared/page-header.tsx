import type { ReactNode } from "react";

type PageHeaderProps = { title: string; description: string; badge?: ReactNode; action?: ReactNode };

export function PageHeader({ title, description, badge, action }: PageHeaderProps) {
  return <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{title}</h1>{badge}</div><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</div>;
}
