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
      <div className="w-full rounded-[10px] border border-line2 dark:border-line2-dark bg-panel2 dark:bg-panel2-dark h-[70px] flex items-center justify-center relative">
        <span className="absolute top-1.5 left-3 text-[9px] tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 select-none">
          Publicidad
        </span>
        <span className="text-[11px] text-ink-4 dark:text-ink-dark-4 select-none">
          728×90
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-[10px] border border-line2 dark:border-line2-dark bg-panel2 dark:bg-panel2-dark ${heights[size]} flex items-center justify-center sticky top-20 relative`}
    >
      <span className="absolute top-1.5 left-3 text-[9px] tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 select-none">
        Publicidad
      </span>
      <span className="text-[11px] text-ink-4 dark:text-ink-dark-4 select-none">
        160×{size === "small" ? "250" : size === "medium" ? "400" : "600"}
      </span>
    </div>
  );
}
