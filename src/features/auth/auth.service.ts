import { DEMO_NEW_PHONE, mockDirectory } from "@/data/mock-user";
import type {
  AccountUser,
  AuthError,
  CanonicalPhone,
  OtpChallenge,
  ProfilePayload,
  ServiceResult,
} from "./auth.types";
import { toCanonicalPhone } from "./auth.utils";

/**
 * MOCK AUTHENTICATION SERVICE.
 *
 * ⚠️ SECURITY NOTE — this is a frontend demo only.
 * The OTP is a hard-coded constant, the "session" is a plain `localStorage`
 * entry with no signature or expiry enforcement, and every check below runs in
 * the browser where a user can trivially bypass it. This is NOT authentication
 * and must never be presented as production-ready.
 *
 * TODO(backend): Replace mock authentication with a real OTP API:
 *   POST /api/auth/otp/request  { phone }            -> { expiresIn, resendAfter }
 *   POST /api/auth/otp/verify   { phone, code }      -> httpOnly session cookie
 *   GET  /api/auth/me                                -> AccountUser
 *   PATCH /api/auth/me          { profile }          -> AccountUser
 *   POST /api/auth/logout
 * Rate limiting, attempt counting, code generation and expiry all belong on the
 * server; the client keeps only the UI state machine.
 */

/** QA-only fixed code. Never rendered in normal UI copy — see README. */
export const MOCK_OTP_CODE = "12345";

export const OTP_LENGTH = 5;
export const OTP_TTL_SECONDS = 120;
export const OTP_RESEND_SECONDS = 45;
export const OTP_MAX_ATTEMPTS = 3;

const SESSION_KEY = "darband.auth.session.v1";
const CHALLENGE_KEY = "darband.auth.challenge.v1";

/** Small, deliberate latency so loading states are real, not decorative. */
const LATENCY = { request: 650, verify: 550, profile: 500 } as const;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fail(code: AuthError["code"], message: string): { ok: false; error: AuthError } {
  return { ok: false, error: { code, message } };
}

/* ------------------------------- storage --------------------------------- */

function readJson<T>(storage: "local" | "session", key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = (storage === "local" ? window.localStorage : window.sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: "local" | "session", key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).setItem(
      key,
      JSON.stringify(value),
    );
  } catch {
    /* storage unavailable — the demo keeps working in memory for this tab */
  }
}

function drop(storage: "local" | "session", key: string) {
  if (typeof window === "undefined") return;
  try {
    (storage === "local" ? window.localStorage : window.sessionStorage).removeItem(key);
  } catch {
    /* ignore */
  }
}

interface StoredChallenge extends OtpChallenge {
  code: string;
}

/* ------------------------------ public API -------------------------------- */

/** Synchronous read used during hydration so the guard does not flash. */
export function readSession(): AccountUser | null {
  return readJson<AccountUser>("local", SESSION_KEY);
}

/** Returns the pending challenge, or `null` when missing or already expired. */
export function readChallenge(): OtpChallenge | null {
  const stored = readJson<StoredChallenge>("session", CHALLENGE_KEY);
  if (!stored) return null;
  if (stored.expiresAt <= Date.now()) {
    drop("session", CHALLENGE_KEY);
    return null;
  }
  const { code, ...challenge } = stored;
  void code;
  return challenge;
}

function buildNewUser(phone: CanonicalPhone): AccountUser {
  return {
    id: `u-${phone.slice(-6)}`,
    phone,
    phoneVerified: true,
    firstName: "",
    lastName: "",
    credit: 0,
    loyaltyPoints: 0,
    createdAt: "امروز",
    acceptedTerms: false,
    newsletter: false,
  };
}

/**
 * Step 1 — ask for a one-time code.
 * A real backend sends an SMS here; the mock only creates a local challenge.
 */
export async function requestOtp(rawPhone: string): Promise<ServiceResult<OtpChallenge>> {
  const phone = toCanonicalPhone(rawPhone);
  if (!phone) {
    return fail("invalid-phone", "شماره موبایل واردشده معتبر نیست.");
  }

  await delay(LATENCY.request);

  const known = Boolean(mockDirectory[phone]) && phone !== DEMO_NEW_PHONE;
  const challenge: StoredChallenge = {
    phone,
    code: MOCK_OTP_CODE,
    expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
    resendAfter: OTP_RESEND_SECONDS,
    attemptsLeft: OTP_MAX_ATTEMPTS,
    isNewUser: !known,
  };
  writeJson("session", CHALLENGE_KEY, challenge);

  // TODO(backend): the SMS provider response would be surfaced here.
  const { code, ...safe } = challenge;
  void code;
  return { ok: true, data: safe };
}

export interface VerifyResult {
  user: AccountUser;
  isNewUser: boolean;
}

/** Step 2 — verify the code and open a (mock) session. */
export async function verifyOtp(
  rawPhone: string,
  inputCode: string,
): Promise<ServiceResult<VerifyResult>> {
  const phone = toCanonicalPhone(rawPhone);
  if (!phone) return fail("invalid-phone", "شماره موبایل واردشده معتبر نیست.");

  await delay(LATENCY.verify);

  const stored = readJson<StoredChallenge>("session", CHALLENGE_KEY);
  if (!stored || stored.phone !== phone) {
    return fail("code-expired", "کد تأیید منقضی شده است. دوباره درخواست دهید.");
  }
  if (Date.now() > stored.expiresAt) {
    drop("session", CHALLENGE_KEY);
    return fail("code-expired", "کد تأیید منقضی شده است. دوباره درخواست دهید.");
  }

  if (inputCode.trim() !== stored.code) {
    const attemptsLeft = stored.attemptsLeft - 1;
    if (attemptsLeft <= 0) {
      drop("session", CHALLENGE_KEY);
      return fail(
        "too-many-attempts",
        "تعداد تلاش‌های مجاز تمام شد. لطفاً کد جدید بگیرید.",
      );
    }
    writeJson("session", CHALLENGE_KEY, { ...stored, attemptsLeft });
    return fail("invalid-code", "کد واردشده درست نیست. دوباره تلاش کنید.");
  }

  const existing = mockDirectory[phone];
  const isNewUser = !existing || phone === DEMO_NEW_PHONE;
  const user: AccountUser = isNewUser ? buildNewUser(phone) : { ...existing };

  drop("session", CHALLENGE_KEY);
  writeJson("local", SESSION_KEY, user);

  return { ok: true, data: { user, isNewUser } };
}

export async function getCurrentUser(): Promise<AccountUser | null> {
  await delay(120);
  return readSession();
}

export async function updateProfile(
  payload: ProfilePayload,
): Promise<ServiceResult<AccountUser>> {
  await delay(LATENCY.profile);
  const current = readSession();
  if (!current) return fail("network", "نشست شما منقضی شده است. دوباره وارد شوید.");

  const next: AccountUser = {
    ...current,
    ...payload,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email?.trim() || undefined,
  };
  writeJson("local", SESSION_KEY, next);
  return { ok: true, data: next };
}

/**
 * Mock "change phone number" flow — issues a fresh challenge for the new number
 * and, once verified, rewrites the stored session.
 * TODO(backend): must be a verified, server-side operation.
 */
export async function requestPhoneChange(rawPhone: string) {
  return requestOtp(rawPhone);
}

export async function confirmPhoneChange(
  rawPhone: string,
  code: string,
): Promise<ServiceResult<AccountUser>> {
  const phone = toCanonicalPhone(rawPhone);
  if (!phone) return fail("invalid-phone", "شماره موبایل واردشده معتبر نیست.");

  const current = readSession();
  const result = await verifyOtp(rawPhone, code);
  if (!result.ok) return result;

  const next: AccountUser = { ...(current ?? result.data.user), phone, phoneVerified: true };
  writeJson("local", SESSION_KEY, next);
  return { ok: true, data: next };
}

export function logout() {
  drop("local", SESSION_KEY);
  drop("session", CHALLENGE_KEY);
}

/** Mock account deletion — clears the local session only. */
export async function requestAccountDeletion(): Promise<ServiceResult<true>> {
  await delay(400);
  // TODO(backend): a real deletion request must be queued and confirmed server-side.
  logout();
  return { ok: true, data: true };
}
