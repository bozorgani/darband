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

/* ------------------------------- Jalali dates ----------------------------- */

/**
 * Converts a Jalali date written in the content layer (`۱۴۰۴/۰۴/۲۵`) to an ISO
 * `YYYY-MM-DD` string, so structured data and the sitemap can expose the real
 * publication date instead of a build-time placeholder.
 * Returns `null` when the input is not a complete Jalali date.
 */
export function jalaliToIsoDate(value: string | undefined | null): string | null {
  if (!value) return null;
  const parts = toEnglishDigits(value).split(/[\/\-]/).map((p) => Number(p.trim()));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;

  const [jy, jm, jd] = parts;
  if (jy < 1000 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;

  /* Jalali → Julian Day Number → Gregorian (integer arithmetic, no deps). */
  const jy1 = jy - 979;
  const jDayNo =
    365 * jy1 + Math.floor(jy1 / 33) * 8 + Math.floor(((jy1 % 33) + 3) / 4) +
    (jm <= 6 ? (jm - 1) * 31 : 186 + (jm - 7) * 30) + (jd - 1);

  let gDayNo = jDayNo + 79;
  let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
  gDayNo %= 146097;

  let leap = true;
  if (gDayNo >= 36525) {
    gDayNo--;
    gy += 100 * Math.floor(gDayNo / 36524);
    gDayNo %= 36524;
    if (gDayNo >= 365) gDayNo++;
    else leap = false;
  }
  gy += 4 * Math.floor(gDayNo / 1461);
  gDayNo %= 1461;
  if (gDayNo >= 366) {
    leap = false;
    gDayNo--;
    gy += Math.floor(gDayNo / 365);
    gDayNo %= 365;
  }

  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 12 && gDayNo >= monthLengths[gm]) {
    gDayNo -= monthLengths[gm];
    gm++;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${gy}-${pad(gm + 1)}-${pad(gDayNo + 1)}`;
}
