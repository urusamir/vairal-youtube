"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FeaturePageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  titleTestId?: string;
};

export function FeaturePageHeader({
  title,
  description,
  actions,
  className,
  titleTestId,
}: FeaturePageHeaderProps) {
  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-sm",
        className
      )}
    >

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <h1
            className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl"
            data-testid={titleTestId}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {description}
          </p>
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
