/** Formatting helpers — Persian digits, currency, dates. */

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
}

/** `485000` → `۴۸۵,۰۰۰` */
export function formatNumber(value: number): string {
  return toPersianDigits(Math.round(value).toLocaleString("en-US"));
}

/** `485000` → `۴۸۵,۰۰۰ تومان` */
export function formatPrice(value: number): string {
  return `${formatNumber(value)} تومان`;
}

/** `0.15` → `۱۵٪` */
export function formatPercent(value: number): string {
  return `${toPersianDigits(Math.round(value * 100))}٪`;
}

export function discountPercent(price: number, compareAt?: number): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatRating(value: number): string {
  return toPersianDigits(value.toFixed(1));
}

export function formatReadingTime(minutes: number): string {
  return `${toPersianDigits(minutes)} دقیقه مطالعه`;
}
