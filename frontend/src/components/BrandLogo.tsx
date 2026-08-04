"use client";

import { BRAND_COLORS, type BrandId } from "@/lib/brands";

interface BrandLogoProps {
  brand: string;
  size?: number;
}

export default function BrandLogo({ brand, size = 28 }: BrandLogoProps) {
  const logos: Record<BrandId, JSX.Element> = {
    ypf: (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill={BRAND_COLORS.ypf} />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="800"
          fontFamily="Archivo, sans-serif"
        >
          YPF
        </text>
      </svg>
    ),
    shell: (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill={BRAND_COLORS.shell} />
        <path
          d="M16 6 C16 6 8 12 8 19 C8 23 11.5 26 16 26 C20.5 26 24 23 24 19 C24 12 16 6 16 6Z"
          fill="none"
          stroke="#DD1D21"
          strokeWidth="1.8"
        />
        <line x1="16" y1="8" x2="16" y2="24" stroke="#DD1D21" strokeWidth="1" />
        <line
          x1="12"
          y1="10"
          x2="10"
          y2="23"
          stroke="#DD1D21"
          strokeWidth="0.8"
        />
        <line
          x1="20"
          y1="10"
          x2="22"
          y2="23"
          stroke="#DD1D21"
          strokeWidth="0.8"
        />
      </svg>
    ),
    axion: (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill={BRAND_COLORS.axion} />
        <path
          d="M10 22 L16 8 L22 22 Z"
          fill="none"
          stroke="#0e1114"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line
          x1="12"
          y1="18"
          x2="20"
          y2="18"
          stroke="#0e1114"
          strokeWidth="1.5"
        />
      </svg>
    ),
    puma: (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="8" fill={BRAND_COLORS.puma} />
        <path
          d="M7 22 C7 22 9 16 12 14 C14 12.5 15 13 16 14 C17 15 18 16 20 15 C22 14 24 11 25 10 L25 14 C25 14 23 18 21 20 C19 22 17 22 15 21 C13 20 12 20 10 22 Z"
          fill="#0e1114"
          opacity="0.9"
        />
      </svg>
    ),
  };

  return logos[brand as BrandId] || logos.ypf;
}
