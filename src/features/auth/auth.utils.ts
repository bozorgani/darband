import { toEnglishDigits, toPersianDigits } from "@/lib/format";
import type { AccountUser, CanonicalPhone } from "./auth.types";

/* =============================== Phone utils ============================== */

/** Iranian mobile numbers: exactly 11 digits, starting with `09` + a valid operator prefix. */
const IR_MOBILE = /^09(0[0-59]|1[0-9]|2[0-2]|3[0-9]|4[1-4]|9[0-9]|8[0-9])\d{7}$/;

/**
 * Reduces user input to the canonical local format `09121234567`.
 * Only Iranian mobile numbers written as **11 digits starting with `09`** are
 * accepted; Persian/Arabic digits, spaces and dashes are tolerated and cleaned.
 * International forms (`+98…`, `0098…`) and 10-digit forms (`912…`) are rejected.
 * Returns `null` when the input is not a valid Iranian mobile number.
 */
export function parseIranMobile(input: string): string | null {
  if (!input) return null;

  const value = toEnglishDigits(input)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\s\-().\u200c]/g, "");

  // Anything non-numeric (letters, `+`, symbols) makes the number invalid.
  if (!/^\d+$/.test(value)) return null;
  if (value.length !== 11) return null;
  if (!IR_MOBILE.test(value)) return null;

  return value;
}

export function isValidIranMobile(input: string): boolean {
  return parseIranMobile(input) !== null;
}

/** Canonical form used everywhere internally — `09121234567`. */
export function toCanonicalPhone(input: string): CanonicalPhone | null {
  return parseIranMobile(input);
}

/** `09121234567` → `۰۹۱۲ ۱۲۳ ۴۵۶۷` (display only). */
export function formatPhoneForDisplay(phone: CanonicalPhone): string {
  if (phone.length !== 11) return toPersianDigits(phone);
  return toPersianDigits(`${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`);
}

/** `09121234567` → `۰۹۱۲ ••• ۴۵۶۷` */
export function maskPhone(phone: CanonicalPhone): string {
  if (phone.length !== 11) return toPersianDigits(phone);
  return `${toPersianDigits(phone.slice(0, 4))} ••• ${toPersianDigits(phone.slice(7))}`;
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
