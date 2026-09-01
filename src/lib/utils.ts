/** Tiny class-name joiner — avoids pulling in `clsx`/`tailwind-merge`. */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Normalizes Persian/Arabic characters so search matches naturally. */
export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[ۀة]/g, "ه")
    .replace(/[\u064B-\u0652\u200c]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
