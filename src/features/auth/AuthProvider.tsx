"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useIsMounted } from "@/hooks";
import type {
  AccountUser,
  AuthError,
  AuthStatus,
  OtpChallenge,
  ProfilePayload,
} from "./auth.types";
import {
  logout as logoutService,
  readChallenge,
  readSession,
  requestOtp,
  updateProfile,
  verifyOtp,
} from "./auth.service";
import { toCanonicalPhone } from "./auth.utils";

/**
 * Single source of truth for the (mock) auth session.
 *
 * ⚠️ Demo only: the session lives in `localStorage` and every check happens in
 * the browser. It provides no real security — see `auth.service.ts`.
 */

interface AuthContextValue {
  user: AccountUser | null;
  isAuthenticated: boolean;
  /** `false` until localStorage has been read — guards must wait for it. */
  hydrated: boolean;
  status: AuthStatus;
  error: AuthError | null;
  challenge: OtpChallenge | null;
  pendingPhone: string | null;

  sendCode: (rawPhone: string) => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  verifyCode: (code: string) => Promise<{ ok: boolean; isNewUser?: boolean }>;
  saveProfile: (payload: ProfilePayload) => Promise<boolean>;
  applyUser: (user: AccountUser) => void;
  signOut: () => void;
  resetFlow: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  /* Render-phase hydration (same pattern as the cart store): read the mock
     session once, immediately after mount, without a hydration mismatch. */
  if (mounted && !hydrated) {
    setHydrated(true);
    const session = readSession();
    /* `readChallenge` already drops expired challenges. */
    const pending = readChallenge();
    if (session) {
      setUser(session);
      setStatus("authenticated");
    } else if (pending) {
      setChallenge(pending);
      setPendingPhone(pending.phone);
      setStatus("codeSent");
    }
  }

  const clearError = useCallback(() => setError(null), []);

  const sendCode = useCallback<AuthContextValue["sendCode"]>(async (rawPhone) => {
    setError(null);
    setStatus("validating");

    const canonical = toCanonicalPhone(rawPhone);
    if (!canonical) {
      setError({ code: "invalid-phone", message: "شماره موبایل واردشده معتبر نیست." });
      setStatus("error");
      return false;
    }

    setStatus("sending");
    const result = await requestOtp(canonical);
    if (!result.ok) {
      setError(result.error);
      setStatus("error");
      return false;
    }

    setChallenge(result.data);
    setPendingPhone(canonical);
    setStatus("codeSent");
    return true;
  }, []);

  const resendCode = useCallback(async () => {
    if (!pendingPhone) return false;
    return sendCode(pendingPhone);
  }, [pendingPhone, sendCode]);

  const verifyCode = useCallback<AuthContextValue["verifyCode"]>(
    async (code) => {
      if (!pendingPhone) {
        setError({ code: "code-expired", message: "ابتدا شماره موبایل خود را وارد کنید." });
        setStatus("error");
        return { ok: false };
      }

      setError(null);
      setStatus("verifying");
      const result = await verifyOtp(pendingPhone, code);

      if (!result.ok) {
        setError(result.error);
        setStatus(result.error.code === "invalid-code" ? "codeSent" : "expired");
        if (result.error.code !== "invalid-code") setChallenge(null);
        return { ok: false };
      }

      setUser(result.data.user);
      setChallenge(null);
      setStatus("authenticated");
      return { ok: true, isNewUser: result.data.isNewUser };
    },
    [pendingPhone],
  );

  const saveProfile = useCallback<AuthContextValue["saveProfile"]>(async (payload) => {
    const result = await updateProfile(payload);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setUser(result.data);
    return true;
  }, []);

  const applyUser = useCallback((next: AccountUser) => setUser(next), []);

  const signOut = useCallback(() => {
    logoutService();
    setUser(null);
    setChallenge(null);
    setPendingPhone(null);
    setError(null);
    setStatus("idle");
  }, []);

  const resetFlow = useCallback(() => {
    setChallenge(null);
    setPendingPhone(null);
    setError(null);
    setStatus("idle");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      hydrated,
      status,
      error,
      challenge,
      pendingPhone,
      sendCode,
      resendCode,
      verifyCode,
      saveProfile,
      applyUser,
      signOut,
      resetFlow,
      clearError,
    }),
    [
      user,
      hydrated,
      status,
      error,
      challenge,
      pendingPhone,
      sendCode,
      resendCode,
      verifyCode,
      saveProfile,
      applyUser,
      signOut,
      resetFlow,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
