import { cn } from "../../lib/cn";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      width={size}
      height={size}
      alt="Tulisin"
      className={cn("rounded-lg", className)}
    />
  );
}
