"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { usePersistentState } from "@/hooks";
import {
  defaultNotificationPrefs,
  mockAddresses,
  mockNotifications,
  mockOrders,
} from "@/data/mock-user";
import type {
  Address,
  AddressPayload,
  AppNotification,
  NotificationPrefs,
  Order,
} from "./account.types";
import { STORAGE_KEYS, buildAddress, sortAddresses } from "./account.service";

/**
 * Client-side store for account data.
 * TODO(backend): swap `usePersistentState` for real fetches + mutations.
 */

interface AccountContextValue {
  orders: Order[];
  getOrder: (id: string) => Order | undefined;

  addresses: Address[];
  defaultAddress: Address | undefined;
  getAddress: (id: string) => Address | undefined;
  addAddress: (payload: AddressPayload) => Address;
  updateAddress: (id: string, payload: AddressPayload) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  notifications: AppNotification[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;

  prefs: NotificationPrefs;
  setPref: (key: keyof NotificationPrefs, value: boolean) => void;

  hydrated: boolean;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses, addressesHydrated] = usePersistentState<Address[]>(
    STORAGE_KEYS.addresses,
    mockAddresses,
  );
  const [notifications, setNotifications, notificationsHydrated] = usePersistentState<
    AppNotification[]
  >(STORAGE_KEYS.notifications, mockNotifications);
  const [prefs, setPrefs] = usePersistentState<NotificationPrefs>(
    STORAGE_KEYS.prefs,
    defaultNotificationPrefs,
  );

  /* Orders stay read-only mock data — a storefront never mutates them. */
  const orders = mockOrders;

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const sorted = useMemo(() => sortAddresses(addresses), [addresses]);

  const addAddress = useCallback(
    (payload: AddressPayload) => {
      const address = buildAddress(payload);
      setAddresses((prev) => {
        const next = address.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : [...prev];
        // The very first address is always the default one.
        if (next.length === 0) address.isDefault = true;
        return [...next, address];
      });
      return address;
    },
    [setAddresses],
  );

  const updateAddress = useCallback(
    (id: string, payload: AddressPayload) => {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) return { ...payload, id };
          return payload.isDefault ? { ...a, isDefault: false } : a;
        }),
      );
    },
    [setAddresses],
  );

  const removeAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (next.length && !next.some((a) => a.isDefault)) next[0] = { ...next[0], isDefault: true };
        return next;
      });
    },
    [setAddresses],
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    },
    [setAddresses],
  );

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [setNotifications],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [setNotifications]);

  const setPref = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [setPrefs],
  );

  const value = useMemo<AccountContextValue>(
    () => ({
      orders,
      getOrder,
      addresses: sorted,
      defaultAddress: sorted.find((a) => a.isDefault),
      getAddress: (id: string) => sorted.find((a) => a.id === id),
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      markRead,
      markAllRead,
      prefs,
      setPref,
      hydrated: addressesHydrated && notificationsHydrated,
    }),
    [
      orders,
      getOrder,
      sorted,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      notifications,
      markRead,
      markAllRead,
      prefs,
      setPref,
      addressesHydrated,
      notificationsHydrated,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  return ctx;
}
