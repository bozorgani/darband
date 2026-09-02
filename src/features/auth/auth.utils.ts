import { toEnglishDigits, toPersianDigits } from "@/lib/format";
import type { AccountUser, CanonicalPhone } from "./auth.types";

/* =============================== Phone utils ============================== */

/** Iranian mobile operator prefixes (`9xx`) that we accept, national form. */
const IR_MOBILE = /^9(0[0-59]|1[0-9]|2[0-2]|3[0-9]|4[1-4]|8[0-9]|9[0-9])\d{7}$/;

/** Persian (`۰-۹`) and Arabic-Indic (`٠-٩`) digits → ASCII. */
function toAsciiDigits(input: string): string {
  return toEnglishDigits(input).replace(/[\u0660-\u0669]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660),
  );
}

/**
 * Reduces any accepted user input to the national significant number
 * (`9121234567`).
 *
 * Accepted: `09121234567`, `9121234567`, `+989121234567`, `00989121234567`,
 * Persian/Arabic digits, spaces, dashes, dots and parentheses.
 * Rejected: landlines, letters, non-Iranian numbers, empty or symbol-only
 * strings and anything that is not `09xxxxxxxxx` after normalisation.
 */
export function parseIranMobile(input: string): string | null {
  if (!input) return null;

  let value = toAsciiDigits(input).replace(/[\s\-().\u200c]/g, "");
  if (!value) return null;

  if (value.startsWith("+98")) value = value.slice(3);
  else if (value.startsWith("0098")) value = value.slice(4);
  else if (value.startsWith("98") && value.length === 12) value = value.slice(2);
  else if (value.startsWith("0")) value = value.slice(1);

  // Anything non-numeric left over (letters, `+`, symbols) is invalid.
  if (!/^\d+$/.test(value)) return null;
  if (value.length !== 10) return null;
  if (!IR_MOBILE.test(value)) return null;

  return value;
}

export function isValidIranMobile(input: string): boolean {
  return parseIranMobile(input) !== null;
}

/** Canonical format stored everywhere internally: `09121234567` → `+989121234567`. */
export function toCanonicalPhone(input: string): CanonicalPhone | null {
  const national = parseIranMobile(input);
  return national ? `+98${national}` : null;
}

/** `+989121234567` → `09121234567` — the local form shown inside inputs. */
export function toLocalPhone(input: string): string {
  const national = parseIranMobile(input);
  return national ? `0${national}` : input;
}

/**
 * Keeps a phone field usable while typing (`09…`) without breaking a pasted
 * international number: as soon as the value parses, it is rewritten to the
 * local `09xxxxxxxxx` form.
 */
export function sanitizePhoneInput(raw: string): string {
  const cleaned = toAsciiDigits(raw).replace(/[^\d+]/g, "").slice(0, 14);
  const national = parseIranMobile(cleaned);
  return national ? `0${national}` : cleaned;
}

/** `+989121234567` → `۰۹۱۲ ۱۲۳ ۴۵۶۷` (display only). */
export function formatPhoneForDisplay(phone: CanonicalPhone): string {
  const national = parseIranMobile(phone);
  if (!national) return toPersianDigits(phone);
  return toPersianDigits(
    `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`,
  );
}

/** `+989121234567` → `۰۹۱۲ ••• ۴۵۶۷` */
export function maskPhone(phone: CanonicalPhone): string {
  const national = parseIranMobile(phone);
  if (!national) return toPersianDigits(phone);
  return `${toPersianDigits(`0${national.slice(0, 3)}`)} ••• ${toPersianDigits(national.slice(6))}`;
}

/* =============================== User utils =============================== */

export function fullName(user: Pick<AccountUser, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function initials(user: Pick<AccountUser, "firstName" | "lastName">): string {
  const a = user.firstName?.trim()?.[0] ?? "";
  const b = user.lastName?.trim()?.[0] ?? "";
  return (a + b).trim() || "کاربر";
}

/** 0..100 — drives the "complete your profile" nudges in the dashboard. */
export function profileCompletion(user: AccountUser): number {
  const checks = [
    Boolean(user.firstName),
    Boolean(user.lastName),
    user.phoneVerified,
    Boolean(user.email),
    Boolean(user.birthDate),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * A brand-new account only has a verified phone; registration is not finished
 * until these fields exist. Used to resume the profile step after a refresh
 * instead of relying on component state.
 */
export function isProfileComplete(user: AccountUser | null | undefined): boolean {
  if (!user) return false;
  return user.firstName.trim() !== "" && user.lastName.trim() !== "" && user.acceptedTerms === true;
}

/* ============================ Validation helpers ========================== */

export function isValidEmail(value: string): boolean {
  if (!value) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

/** Iranian postal codes are exactly 10 digits. */
export function isValidPostalCode(value: string): boolean {
  return /^\d{10}$/.test(toEnglishDigits(value).replace(/[\s-]/g, ""));
}

export function normalizeDigits(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}
