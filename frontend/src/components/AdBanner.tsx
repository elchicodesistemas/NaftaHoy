"use client";

interface AdBannerProps {
  position: "sidebar" | "horizontal";
  size?: "small" | "medium" | "large";
}

export default function AdBanner({ position, size = "medium" }: AdBannerProps) {
  const heights = {
    small: "h-[250px]",
    medium: "h-[400px]",
    large: "h-[600px]",
  };

  if (position === "horizontal") {
    return (
      <div className="w-full rounded-lg border border-dashed border-surface-300 dark:border-dark-border bg-surface-100/50 dark:bg-dark-card/50 h-[90px] flex items-center justify-center">
        <span className="text-xs text-zinc-400 dark:text-zinc-600 select-none">
          Espacio publicitario — 728x90
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-lg border border-dashed border-surface-300 dark:border-dark-border bg-surface-100/50 dark:bg-dark-card/50 ${heights[size]} flex items-center justify-center sticky top-20`}
    >
      <div className="text-center">
        <span className="text-xs text-zinc-400 dark:text-zinc-600 block select-none">
          Publicidad
        </span>
        <span className="text-[10px] text-zinc-300 dark:text-zinc-700 select-none">
          160x{size === "small" ? "250" : size === "medium" ? "400" : "600"}
        </span>
      </div>
    </div>
  );
}
