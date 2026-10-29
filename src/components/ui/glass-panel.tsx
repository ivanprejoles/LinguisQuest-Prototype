import type { HTMLAttributes } from "react";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  intensity?: "light" | "medium" | "strong";
};

const intensityClasses = {
  light: "bg-[#10182A]/35 backdrop-blur-md",
  medium: "bg-[#10182A]/55 backdrop-blur-xl",
  strong: "bg-[#10182A]/80 backdrop-blur-2xl",
};

export function GlassPanel({
  intensity = "medium",
  className = "",
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 shadow-xl shadow-black/20 ${intensityClasses[intensity]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
