"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Primitives";
import { Drawer, Modal } from "@/components/ui/Overlay";
import { EmptyState } from "@/components/ui/Feedback";
import { CheckIcon, EditIcon, PinIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { provinces } from "@/data/mock-user";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/store/toast";
import {
  isValidIranMobile,
  isValidPostalCode,
  normalizeDigits,
  formatPhoneForDisplay,
  sanitizePhoneInput,
  toCanonicalPhone,
  toLocalPhone,
} from "@/features/auth/auth.utils";
import type { Address, AddressPayload } from "./account.types";
import { useAccount } from "./AccountProvider";
import { AccountPageHeader } from "./AccountShell";

export function AddressesView() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress, hydrated } =
    useAccount();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);

  return (
    <>
      <AccountPageHeader
        title="نشانی‌ها"
        description="نشانی‌های تحویل سفارش را مدیریت کنید. نشانی پیش‌فرض هنگام تسویه‌حساب انتخاب می‌شود."
        breadcrumb={[{ label: "نشانی‌ها" }]}
        action={
          <Button onClick={() => setCreating(true)} data-testid="add-address">
            <PlusIcon className="size-4" />
            افزودن نشانی
          </Button>
        }
      />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
          <div className="skeleton-shimmer h-52 rounded-3xl" />
          <div className="skeleton-shimmer h-52 rounded-3xl" />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<PinIcon className="size-7" />}
          title="هنوز نشانی ثبت نکرده‌اید"
          description="برای تحویل سریع‌تر سفارش، نشانی خود را اضافه کنید تا در خریدهای بعدی آماده باشد."
          secondary={
            <Button onClick={() => setCreating(true)}>
              <PlusIcon className="size-4" />
              افزودن اولین نشانی
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" data-testid="address-list">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn(
                "flex flex-col rounded-3xl border bg-white/70 p-5 transition-colors",
                address.isDefault ? "border-espresso-900/40" : "border-beige-300/70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold text-espresso-900">
                    <PinIcon className="size-4 text-accent-600" />
                    {address.title}
                  </h2>
                  <p className="mt-1 text-xs text-ash-600">{address.recipient}</p>
                </div>
                {address.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-espresso-900 px-2.5 py-1 text-[0.65rem] font-semibold text-cream-50">
                    <CheckIcon className="size-3" />
                    پیش‌فرض
                  </span>
                )}
              </div>

              <address className="mt-3 flex-1 not-italic text-xs/6 text-ash-600">
                {address.province}، {address.city}، {address.line}، پلاک{" "}
                {toPersianDigits(address.plaque)}
                {address.unit && `، واحد ${toPersianDigits(address.unit)}`}
                <br />
                کدپستی: <span dir="ltr">{toPersianDigits(address.postalCode)}</span>
                <br />
                تلفن: <span dir="ltr">{formatPhoneForDisplay(address.phone)}</span>
                {address.note && (
                  <>
                    <br />
                    <span className="text-ash-400">{address.note}</span>
                  </>
                )}
              </address>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-beige-300/60 pt-4">
                <Button size="sm" variant="outline" onClick={() => setEditing(address)}>
                  <EditIcon className="size-4" />
                  ویرایش
                </Button>
                {!address.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDefaultAddress(address.id);
                      toast({ tone: "success", title: "نشانی پیش‌فرض تغییر کرد" });
                    }}
                  >
                    انتخاب به‌عنوان پیش‌فرض
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  className="ms-auto"
                  onClick={() => setConfirmDelete(address)}
                  aria-label={`حذف نشانی ${address.title}`}
                >
                  <TrashIcon className="size-4" />
                  حذف
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(creating || editing) && (
        <AddressFormDrawer
          address={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) {
              updateAddress(editing.id, payload);
              toast({ tone: "success", title: "نشانی به‌روزرسانی شد" });
            } else {
              addAddress(payload);
              toast({ tone: "success", title: "نشانی جدید ذخیره شد" });
            }
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(null)} title="حذف نشانی">
          <p className="text-sm/7 text-ash-600">
            نشانی «{confirmDelete.title}» حذف شود؟ این کار قابل بازگشت نیست.
          </p>
          <div className="mt-6 flex gap-2">
            <Button
              variant="danger"
              fullWidth
              data-testid="confirm-delete-address"
              onClick={() => {
                removeAddress(confirmDelete.id);
                setConfirmDelete(null);
                toast({ tone: "danger", title: "نشانی حذف شد" });
              }}
            >
              بله، حذف شود
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              انصراف
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* -------------------------------- The form -------------------------------- */

type FormErrors = Partial<Record<keyof AddressPayload, string>>;

const emptyPayload: AddressPayload = {
  title: "",
  recipient: "",
  phone: "",
  province: provinces[0].name,
  city: provinces[0].cities[0],
  line: "",
  plaque: "",
  unit: "",
  postalCode: "",
  note: "",
  isDefault: false,
};

function AddressFormDrawer({
  address,
  onClose,
  onSubmit,
}: {
  address?: Address;
  onClose: () => void;
  onSubmit: (payload: AddressPayload) => void;
}) {
  const [form, setForm] = useState<AddressPayload>(() =>
    address
      ? { ...address, phone: toLocalPhone(address.phone) }
      : emptyPayload,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const firstErrorRef = useRef<HTMLInputElement>(null);

  const cities = provinces.find((p) => p.name === form.province)?.cities ?? [];

  const set = <K extends keyof AddressPayload>(key: K, value: AddressPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors: FormErrors = {};
    if (form.title.trim().length < 2) nextErrors.title = "عنوان نشانی را وارد کنید.";
    if (form.recipient.trim().length < 3) nextErrors.recipient = "نام تحویل‌گیرنده را وارد کنید.";
    if (!isValidIranMobile(form.phone)) nextErrors.phone = "شماره موبایل واردشده معتبر نیست.";
    if (form.line.trim().length < 10) nextErrors.line = "نشانی کامل را وارد کنید.";
    if (!normalizeDigits(form.plaque)) nextErrors.plaque = "پلاک را وارد کنید.";
    if (!isValidPostalCode(form.postalCode)) nextErrors.postalCode = "کد پستی باید ۱۰ رقم باشد.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      firstErrorRef.current?.focus();
      return;
    }

    setSaving(true);
    /* Mock latency so the saving state is visible. */
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);

    onSubmit({
      ...form,
      phone: toCanonicalPhone(form.phone) ?? form.phone,
      postalCode: normalizeDigits(form.postalCode),
      unit: form.unit?.trim() || undefined,
      note: form.note?.trim() || undefined,
    });
  }

  const firstErrorKey = (Object.keys(errors) as (keyof AddressPayload)[]).find((k) => errors[k]);

  return (
    <Drawer
      open
      onClose={onClose}
      title={address ? "ویرایش نشانی" : "افزودن نشانی"}
      description="اطلاعات تحویل سفارش"
      className="max-w-[32rem]"
      footer={
        <div className="flex gap-2">
          <Button type="submit" form="address-form" fullWidth disabled={saving} data-testid="save-address">
            {saving ? "در حال ذخیره…" : address ? "ذخیره تغییرات" : "ذخیره نشانی"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
        </div>
      }
    >
      <form id="address-form" onSubmit={handleSubmit} noValidate className="space-y-4 p-5">
        <Input
          ref={firstErrorKey === "title" ? firstErrorRef : undefined}
          label="عنوان نشانی"
          name="title"
          placeholder="خانه، محل کار…"
          value={form.title}
          error={errors.title}
          data-testid="address-title"
          onChange={(e) => set("title", e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            ref={firstErrorKey === "recipient" ? firstErrorRef : undefined}
            label="نام و نام خانوادگی تحویل‌گیرنده"
            name="recipient"
            autoComplete="name"
            value={form.recipient}
            error={errors.recipient}
            data-testid="address-recipient"
            onChange={(e) => set("recipient", e.target.value)}
          />
          <Input
            ref={firstErrorKey === "phone" ? firstErrorRef : undefined}
            label="شماره موبایل"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="09123456789"
            value={form.phone}
            error={errors.phone}
            data-testid="address-phone"
            onChange={(e) => set("phone", sanitizePhoneInput(e.target.value))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className="mb-1.5 block text-xs font-semibold text-espresso-800">
              استان
            </label>
            <select
              id="province"
              name="province"
              value={form.province}
              onChange={(e) => {
                const province = e.target.value;
                const firstCity =
                  provinces.find((p) => p.name === province)?.cities[0] ?? "";
                setForm((prev) => ({ ...prev, province, city: firstCity }));
              }}
              className="h-11 w-full rounded-full border border-espresso-900/15 bg-white/80 px-4 text-sm text-espresso-900 transition-colors hover:border-espresso-900/30 focus:border-accent-600 focus:outline-none"
            >
              {provinces.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="mb-1.5 block text-xs font-semibold text-espresso-800">
              شهر
            </label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="h-11 w-full rounded-full border border-espresso-900/15 bg-white/80 px-4 text-sm text-espresso-900 transition-colors hover:border-espresso-900/30 focus:border-accent-600 focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="line" className="mb-1.5 block text-xs font-semibold text-espresso-800">
            نشانی کامل
          </label>
          <textarea
            id="line"
            name="line"
            rows={3}
            value={form.line}
            aria-invalid={Boolean(errors.line)}
            aria-describedby={errors.line ? "line-error" : undefined}
            data-testid="address-line"
            onChange={(e) => set("line", e.target.value)}
            className={cn(
              "w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-espresso-900 placeholder:text-ash-400 transition-colors focus:border-accent-600 focus:outline-none",
              errors.line ? "border-danger" : "border-espresso-900/15",
            )}
            placeholder="خیابان، کوچه، ساختمان"
          />
          {errors.line && (
            <p id="line-error" className="mt-1.5 text-[0.7rem] font-medium text-danger">
              {errors.line}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            ref={firstErrorKey === "plaque" ? firstErrorRef : undefined}
            label="پلاک"
            name="plaque"
            inputMode="numeric"
            value={form.plaque}
            error={errors.plaque}
            data-testid="address-plaque"
            onChange={(e) => set("plaque", e.target.value)}
          />
          <Input
            label="واحد (اختیاری)"
            name="unit"
            inputMode="numeric"
            value={form.unit ?? ""}
            onChange={(e) => set("unit", e.target.value)}
          />
          <Input
            ref={firstErrorKey === "postalCode" ? firstErrorRef : undefined}
            label="کد پستی"
            name="postalCode"
            inputMode="numeric"
            dir="ltr"
            maxLength={12}
            value={form.postalCode}
            error={errors.postalCode}
            data-testid="address-postal"
            onChange={(e) => set("postalCode", e.target.value)}
          />
        </div>

        <Input
          label="توضیحات برای پیک (اختیاری)"
          name="note"
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value)}
        />

        <label className="flex cursor-pointer items-center gap-3 pt-1 text-sm text-espresso-800">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="size-[18px] rounded-[6px] accent-espresso-900"
          />
          این نشانی، نشانی پیش‌فرض من باشد.
        </label>
      </form>
    </Drawer>
  );
}
