/**
 * Auth & account domain types.
 *
 * These mirror the payloads a real commerce/identity backend would return, so
 * swapping `auth.service.ts` for real HTTP calls will not touch the UI layer.
 */

/** Canonical phone format used everywhere internally: `09121234567` (11 digits). */
export type CanonicalPhone = string;

export interface AccountUser {
  id: string;
  /** Canonical E.164 Iranian mobile number. */
  phone: CanonicalPhone;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  email?: string;
  /** Jalali date string, e.g. `۱۳۷۰/۰۵/۱۲` is displayed; stored as `1370-05-12`. */
  birthDate?: string;
  gender?: "female" | "male" | "unspecified";
  /** Mock loyalty balance in Toman. */
  credit: number;
  loyaltyPoints: number;
  createdAt: string;
  acceptedTerms: boolean;
  newsletter: boolean;
}

export type ProfilePayload = Pick<
  AccountUser,
  "firstName" | "lastName"
> &
  Partial<Pick<AccountUser, "email" | "birthDate" | "gender" | "newsletter" | "acceptedTerms">>;

/**
 * UI state machine for the whole auth flow.
 * `codeSent` and `expired` are OTP-specific, the rest are shared.
 */
export type AuthStatus =
  | "idle"
  | "validating"
  | "sending"
  | "codeSent"
  | "verifying"
  | "authenticated"
  | "error"
  | "expired";

export type AuthErrorCode =
  | "invalid-phone"
  | "invalid-code"
  | "code-expired"
  | "too-many-attempts"
  | "throttled"
  | "network";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface OtpChallenge {
  phone: CanonicalPhone;
  /** Epoch ms. */
  expiresAt: number;
  /** Seconds the UI must wait before offering "resend". */
  resendAfter: number;
  attemptsLeft: number;
  /** Mock-only hint: true when no account exists for this phone yet. */
  isNewUser: boolean;
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AuthError };
