export type BrandId = "ypf" | "shell" | "axion" | "puma" | "dapsa" | "gulf" | "blanca";

/**
 * Colores de marca del rediseño. Se importan desde tailwind.config.ts para
 * exponerlos como tokens (`brand-ypf`, `brand-shell`, ...) y evitar hex sueltos
 * en los componentes.
 */
export const BRAND_COLORS: Record<BrandId, string> = {
  ypf: "#2e7cf6",
  shell: "#ffd500",
  axion: "#b44ce8",
  puma: "#00c46a",
  dapsa: "#ff7a45",
  gulf: "#4aa8ff",
  blanca: "#94989f",
};

export const BRAND_TEXT_ON: Record<BrandId, string> = {
  ypf: "#fff",
  shell: "#332b00",
  axion: "#fff",
  puma: "#04150c",
  dapsa: "#fff",
  gulf: "#04121f",
  blanca: "#141414",
};

export const BRAND_NAMES: Record<BrandId, string> = {
  ypf: "YPF",
  shell: "Shell",
  axion: "Axion Energy",
  puma: "Puma Energy",
  dapsa: "DAPSA",
  gulf: "Gulf",
  blanca: "Estación blanca",
};

export function brandColor(brand: string): string {
  return BRAND_COLORS[brand as BrandId] ?? BRAND_COLORS.blanca;
}

export function brandTextOn(brand: string): string {
  return BRAND_TEXT_ON[brand as BrandId] ?? BRAND_TEXT_ON.blanca;
}
