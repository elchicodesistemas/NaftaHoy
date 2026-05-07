export interface FuelPrice {
  type: string;
  price: number;
  prevPrice: number;
}

export interface Company {
  id: string;
  name: string;
  shortName: string;
  fuels: FuelPrice[];
  lastUpdate: string;
}

export const companies: Company[] = [
  {
    id: "ypf",
    name: "YPF",
    shortName: "YPF",
    fuels: [
      { type: "Nafta Súper", price: 1999, prevPrice: 1954 },
      { type: "Nafta Premium", price: 2299, prevPrice: 2252 },
      { type: "Diesel", price: 1899, prevPrice: 1865 },
      { type: "Diesel Premium", price: 2199, prevPrice: 2156 },
      { type: "GNC", price: 520, prevPrice: 510 },
    ],
    lastUpdate: "2026-04-23T14:30:00",
  },
  {
    id: "shell",
    name: "Shell",
    shortName: "Shell",
    fuels: [
      { type: "Nafta Súper", price: 2099, prevPrice: 2068 },
      { type: "V-Power Nafta", price: 2450, prevPrice: 2421 },
      { type: "Diesel", price: 1980, prevPrice: 1947 },
      { type: "V-Power Diesel", price: 2380, prevPrice: 2347 },
      { type: "GNC", price: 540, prevPrice: 530 },
    ],
    lastUpdate: "2026-04-23T13:00:00",
  },
  {
    id: "axion",
    name: "Axion Energy",
    shortName: "Axion",
    fuels: [
      { type: "Nafta Súper", price: 2039, prevPrice: 2049 },
      { type: "Quantium", price: 2390, prevPrice: 2371 },
      { type: "Diesel", price: 1950, prevPrice: 1929 },
      { type: "Quantium Diesel", price: 2290, prevPrice: 2269 },
      { type: "GNC", price: 530, prevPrice: 525 },
    ],
    lastUpdate: "2026-04-23T12:45:00",
  },
  {
    id: "puma",
    name: "Puma Energy",
    shortName: "Puma",
    fuels: [
      { type: "Nafta Súper", price: 1979, prevPrice: 1920 },
      { type: "Nafta Premium", price: 2270, prevPrice: 2208 },
      { type: "Diesel", price: 1870, prevPrice: 1824 },
      { type: "Diesel Premium", price: 2150, prevPrice: 2103 },
      { type: "GNC", price: 510, prevPrice: 500 },
    ],
    lastUpdate: "2026-04-23T11:00:00",
  },
];

export const weeklyTrend = [
  { day: "Lun", ypf: 1954, shell: 2068, axion: 2049, puma: 1920 },
  { day: "Mar", ypf: 1960, shell: 2070, axion: 2045, puma: 1935 },
  { day: "Mié", ypf: 1975, shell: 2078, axion: 2042, puma: 1955 },
  { day: "Jue", ypf: 1990, shell: 2085, axion: 2040, puma: 1970 },
  { day: "Vie", ypf: 1995, shell: 2090, axion: 2039, puma: 1975 },
  { day: "Sáb", ypf: 1999, shell: 2095, axion: 2039, puma: 1979 },
  { day: "Hoy", ypf: 1999, shell: 2099, axion: 2039, puma: 1979 },
];
