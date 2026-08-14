import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  danger?: boolean;
}

export function MenuItem({ icon, danger = false, children, ...props }: MenuItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors focus-visible:outline-none",
        danger
          ? "text-danger hover:bg-danger-surface"
          : "text-content-secondary hover:bg-surface-hover hover:text-content-primary",
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
