import { type ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {desc && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
