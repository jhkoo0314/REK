import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.06em]">{title}</h1>
        <p className="mt-1 text-sm text-[#77736e]">{description}</p>
      </div>
      {action}
    </div>
  );
}
