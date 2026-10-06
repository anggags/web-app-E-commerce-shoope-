const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

/** 150000 -> "Rp150.000" */
export function formatIDR(value: number): string {
  return idrFormatter.format(value);
}

/** 150000 -> "Rp150.000" (sama dengan formatIDR, kept for readability) */
export function formatPrice(value: number): string {
  return formatIDR(value);
}

/** 1200 -> "1.200" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function calculateDiscountPercent(price: number, compareAtPrice?: number | null) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
