import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: React.ReactNode;
  eyebrow?: ReactNode;
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-primary mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
            <span aria-hidden className="bg-primary/50 h-px w-6" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-relaxed sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
