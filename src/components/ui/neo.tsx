import * as React from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<Tone, string> = {
  default: "border-[var(--neo-line)] bg-[var(--neo-surface)] text-foreground",
  primary: "border-[var(--neo-line-strong)] bg-cyan-950/45 text-cyan-100",
  success: "border-[var(--neo-line-strong)] bg-emerald-950/45 text-emerald-100",
  warning: "border-[var(--neo-line-strong)] bg-amber-950/45 text-amber-100",
  danger: "border-[var(--neo-line-strong)] bg-red-950/45 text-red-100",
  info: "border-[var(--neo-line-strong)] bg-blue-950/45 text-blue-100",
};

const valueToneClasses: Record<Tone, string> = {
  default: "text-white",
  primary: "text-cyan-300",
  success: "text-emerald-300",
  warning: "text-amber-300",
  danger: "text-red-300",
  info: "text-blue-300",
};

export function NeoPage({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 md:py-8", className)}>
      {children}
    </div>
  );
}

type NeoPanelProps = React.ComponentProps<typeof Card> & {
  subtle?: boolean;
};

export function NeoPanel({ className, subtle = false, ...props }: NeoPanelProps) {
  return (
    <Card
      variant={subtle ? "neoSubtle" : "neo"}
      className={cn("rounded-[var(--neo-radius)]", className)}
      {...props}
    />
  );
}

export function NeoHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <NeoPanel className={cn("p-5 md:p-7", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <div className="text-xs font-black uppercase tracking-normal text-muted-foreground">
              {eyebrow}
            </div>
          ) : null}
          <div className="break-words text-3xl font-black leading-tight text-white md:text-4xl">
            {title}
          </div>
          {description ? (
            <p className="max-w-3xl text-base font-medium text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div> : null}
      </div>
    </NeoPanel>
  );
}

export function NeoToolbar({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--neo-radius)] border-2 border-[var(--neo-line)] bg-[var(--neo-surface)] p-2 shadow-[var(--neo-shadow-sm)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function NeoStat({
  label,
  value,
  tone = "default",
  icon,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: Tone;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--neo-radius)] border-2 p-4 shadow-[var(--neo-shadow-sm)]",
        toneClasses[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn("text-3xl font-black leading-none", valueToneClasses[tone])}>
            {value}
          </div>
          <div className="mt-2 text-sm font-semibold text-muted-foreground">{label}</div>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
    </div>
  );
}

export function NeoSectionTitle({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-2xl font-black leading-tight text-white">{title}</h2>
      {description ? (
        <p className="text-base font-medium text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
