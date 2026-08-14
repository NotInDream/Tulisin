import type { ReactNode } from "react";

interface SidebarLinkProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}

export function SidebarLink({ href, icon, children }: SidebarLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {icon}
      <span className="truncate">{children}</span>
    </a>
  );
}
