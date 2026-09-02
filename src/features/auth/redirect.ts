/**
 * Central redirect validation for the auth flow.
 *
 * A naive `next.startsWith("/")` check is NOT enough: protocol-relative URLs
 * such as `//example.com` also start with a slash and would let an attacker
 * bounce a visitor to another origin straight after sign-in (open redirect).
 * Every auth redirect goes through `getSafeRedirectPath()` — never re-implement
 * this check inside a component.
 */

/** Where the flow lands when `next` is missing or rejected. */
export const DEFAULT_REDIRECT = "/account";

/** Only the customer panel may be used as a post-login destination. */
const ALLOWED_PREFIXES = ["/account"] as const;

/** Control characters, whitespace and the separators used in URL smuggling. */
const FORBIDDEN = /[\s\\\u0000-\u001f\u007f\u2028\u2029]/;

function decodeOnce(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null; // malformed percent-encoding
  }
}

function looksInternal(candidate: string): boolean {
  if (!candidate.startsWith("/")) return false; // absolute URLs, `javascript:`, `data:`
  if (candidate.startsWith("//")) return false; // protocol-relative → other origin
  if (FORBIDDEN.test(candidate)) return false; // `/\evil`, control chars, spaces
  if (candidate.includes("://")) return false;
  if (candidate.includes("..")) return false; // path traversal
  return true;
}

/**
 * `true` when `raw` is a safe, internal, allow-listed account path.
 * Both the raw and the decoded form must pass, so `/%5cexample.com` is rejected.
 */
export function isSafeInternalPath(raw: string | null | undefined): boolean {
  if (!raw) return false;

  const decoded = decodeOnce(raw);
  if (decoded === null) return false;
  if (!looksInternal(raw) || !looksInternal(decoded)) return false;

  const pathname = decoded.split(/[?#]/)[0];
  return ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Returns the requested path when it is safe, otherwise `/account`. */
export function getSafeRedirectPath(raw: string | null | undefined): string {
  if (!isSafeInternalPath(raw)) return DEFAULT_REDIRECT;
  return decodeOnce(raw as string) ?? DEFAULT_REDIRECT;
}
