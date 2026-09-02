import type { AccountUser } from "@/features/auth/auth.types";
import type {
  Address,
  AppNotification,
  NotificationPrefs,
  Order,
} from "@/features/account/account.types";

/**
 * MOCK DATA — customer account.
 *
 * TODO(backend): replace with `GET /api/account/me`, `/orders`, `/addresses`,
 * `/notifications`. No real personal data is used here; every value is invented
 * for the demo.
 */

/* ================================== Users ================================= */

/** Phone numbers wired for QA (see README). */
export const DEMO_EXISTING_PHONE = "+989121234567";
export const DEMO_NEW_PHONE = "+989120000000";

export const mockUser: AccountUser = {
  id: "u-001",
  phone: DEMO_EXISTING_PHONE,
  phoneVerified: true,
  firstName: "سارا",
  lastName: "محمدی",
  email: "sara.mohammadi@example.com",
  birthDate: "1370-05-12",
  gender: "female",
  credit: 250_000,
  loyaltyPoints: 1_240,
  createdAt: "۱۴۰۲/۱۱/۰۳",
  acceptedTerms: true,
  newsletter: true,
};

/** Registered demo accounts. Any other valid number is treated as a new user. */
export const mockDirectory: Record<string, AccountUser> = {
  [DEMO_EXISTING_PHONE]: mockUser,
};

/* ================================ Addresses =============================== */

export const mockAddresses: Address[] = [
  {
    id: "a-001",
    title: "خانه",
    recipient: "سارا محمدی",
    phone: "+989121234567",
    province: "تهران",
    city: "تهران",
    line: "خیابان ولیعصر، بالاتر از پارک‌وی، کوچه یاسمن",
    plaque: "۲۴",
    unit: "۵",
    postalCode: "1968813456",
    note: "تحویل در ساعات اداری به نگهبانی",
    isDefault: true,
  },
  {
    id: "a-002",
    title: "محل کار",
    recipient: "سارا محمدی",
    phone: "+989121234567",
    province: "تهران",
    city: "تهران",
    line: "خیابان شریعتی، نرسیده به میدان قدس، ساختمان آرام",
    plaque: "۱۱۲",
    unit: "۳",
    postalCode: "1934567890",
    isDefault: false,
  },
];

/* ================================= Orders ================================= */

export const mockOrders: Order[] = [
  {
    id: "DB-14040512",
    number: "DB-14040512",
    date: "۱۴۰۴/۰۵/۱۲",
    status: "processing",
    items: [
      {
        productId: "p-001",
        slug: "ethiopia-yirgacheffe",
        title: "اتیوپی یرگاچف",
        image: "/images/products/ethiopia-1.jpg",
        unitPrice: 485_000,
        quantity: 2,
        options: [
          { label: "نوع", value: "دانه کامل" },
          { label: "وزن", value: "۲۵۰ گرم" },
        ],
      },
      {
        productId: "p-015",
        slug: "paper-filters-100",
        title: "فیلتر کاغذی وی‌۶۰ (۱۰۰ عدد)",
        image: "/images/products/filter-1.jpg",
        unitPrice: 145_000,
        quantity: 1,
        options: [],
      },
    ],
    subtotal: 1_115_000,
    discount: 111_500,
    shipping: 89_000,
    total: 1_092_500,
    paymentMethod: "پرداخت اینترنتی (نمایشی)",
    paymentRef: "۸۸۱۲۳۴۵۶",
    addressId: "a-001",
    timeline: [
      { key: "placed", label: "ثبت سفارش", date: "۱۴۰۴/۰۵/۱۲ — ۱۰:۲۴", done: true },
      { key: "paid", label: "پرداخت موفق", date: "۱۴۰۴/۰۵/۱۲ — ۱۰:۲۶", done: true },
      { key: "roasting", label: "رست و بسته‌بندی", date: "۱۴۰۴/۰۵/۱۳ — ۰۸:۱۰", done: true },
      { key: "shipped", label: "تحویل به پست", done: false },
      { key: "delivered", label: "تحویل به مشتری", done: false },
    ],
  },
  {
    id: "DB-14040428",
    number: "DB-14040428",
    date: "۱۴۰۴/۰۴/۲۸",
    status: "shipped",
    items: [
      {
        productId: "p-005",
        slug: "signature-espresso",
        title: "اسپرسوی امضای دربند",
        image: "/images/products/espresso-1.jpg",
        unitPrice: 430_000,
        quantity: 1,
        options: [
          { label: "نوع", value: "آسیاب‌شده" },
          { label: "درجه آسیاب", value: "اسپرسو" },
          { label: "وزن", value: "۵۰۰ گرم" },
        ],
      },
    ],
    subtotal: 610_000,
    discount: 0,
    shipping: 89_000,
    total: 699_000,
    paymentMethod: "پرداخت اینترنتی (نمایشی)",
    paymentRef: "۸۸۱۲۰۹۸۷",
    addressId: "a-002",
    trackingCode: "۲۴۵۹۸۷۶۵۴۳۲۱",
    timeline: [
      { key: "placed", label: "ثبت سفارش", date: "۱۴۰۴/۰۴/۲۸ — ۱۹:۰۲", done: true },
      { key: "paid", label: "پرداخت موفق", date: "۱۴۰۴/۰۴/۲۸ — ۱۹:۰۳", done: true },
      { key: "roasting", label: "رست و بسته‌بندی", date: "۱۴۰۴/۰۴/۲۹ — ۰۹:۴۰", done: true },
      { key: "shipped", label: "تحویل به پست", date: "۱۴۰۴/۰۴/۳۰ — ۱۲:۱۵", done: true },
      { key: "delivered", label: "تحویل به مشتری", done: false },
    ],
  },
  {
    id: "DB-14040317",
    number: "DB-14040317",
    date: "۱۴۰۴/۰۳/۱۷",
    status: "delivered",
    items: [
      {
        productId: "p-012",
        slug: "manual-grinder-pro",
        title: "آسیاب دستی حرفه‌ای",
        image: "/images/products/grinder-1.jpg",
        unitPrice: 2_450_000,
        quantity: 1,
        options: [],
      },
      {
        productId: "p-006",
        slug: "house-blend-daily",
        title: "ترکیب خانگی روزانه",
        image: "/images/products/blend-1.jpg",
        unitPrice: 315_000,
        quantity: 2,
        options: [{ label: "وزن", value: "۲۵۰ گرم" }],
      },
    ],
    subtotal: 3_080_000,
    discount: 308_000,
    shipping: 0,
    total: 2_772_000,
    paymentMethod: "پرداخت اینترنتی (نمایشی)",
    paymentRef: "۸۷۹۹۱۲۳۴",
    addressId: "a-001",
    trackingCode: "۲۴۵۹۱۱۲۲۳۳۴۴",
    timeline: [
      { key: "placed", label: "ثبت سفارش", date: "۱۴۰۴/۰۳/۱۷ — ۱۳:۴۸", done: true },
      { key: "paid", label: "پرداخت موفق", date: "۱۴۰۴/۰۳/۱۷ — ۱۳:۵۰", done: true },
      { key: "roasting", label: "رست و بسته‌بندی", date: "۱۴۰۴/۰۳/۱۸ — ۱۰:۰۵", done: true },
      { key: "shipped", label: "تحویل به پست", date: "۱۴۰۴/۰۳/۱۹ — ۰۹:۳۰", done: true },
      { key: "delivered", label: "تحویل به مشتری", date: "۱۴۰۴/۰۳/۲۱ — ۱۶:۱۲", done: true },
    ],
  },
  {
    id: "DB-14040205",
    number: "DB-14040205",
    date: "۱۴۰۴/۰۲/۰۵",
    status: "cancelled",
    items: [
      {
        productId: "p-007",
        slug: "panama-geisha",
        title: "پاناما گیشا",
        image: "/images/products/ethiopia-1.jpg",
        unitPrice: 1_850_000,
        quantity: 1,
        options: [{ label: "وزن", value: "۱۰۰ گرم" }],
      },
    ],
    subtotal: 1_850_000,
    discount: 0,
    shipping: 0,
    total: 1_850_000,
    paymentMethod: "پرداخت اینترنتی (نمایشی)",
    addressId: "a-001",
    timeline: [
      { key: "placed", label: "ثبت سفارش", date: "۱۴۰۴/۰۲/۰۵ — ۱۱:۰۰", done: true },
      { key: "cancelled", label: "لغو سفارش به درخواست مشتری", date: "۱۴۰۴/۰۲/۰۵ — ۱۸:۳۰", done: true },
    ],
  },
  {
    id: "DB-14040131",
    number: "DB-14040131",
    date: "۱۴۰۴/۰۱/۳۱",
    status: "awaiting-payment",
    items: [
      {
        productId: "p-016",
        slug: "discovery-gift-box",
        title: "جعبه کشف طعم",
        image: "/images/products/gift-1.jpg",
        unitPrice: 1_290_000,
        quantity: 1,
        options: [],
      },
    ],
    subtotal: 1_290_000,
    discount: 0,
    shipping: 89_000,
    total: 1_379_000,
    paymentMethod: "در انتظار پرداخت",
    addressId: "a-002",
    timeline: [
      { key: "placed", label: "ثبت سفارش", date: "۱۴۰۴/۰۱/۳۱ — ۲۲:۱۴", done: true },
      { key: "paid", label: "پرداخت", done: false },
      { key: "roasting", label: "رست و بسته‌بندی", done: false },
      { key: "shipped", label: "تحویل به پست", done: false },
      { key: "delivered", label: "تحویل به مشتری", done: false },
    ],
  },
];

/* ============================== Notifications ============================= */

export const mockNotifications: AppNotification[] = [
  {
    id: "n-001",
    kind: "order",
    title: "سفارش شما در حال آماده‌سازی است",
    body: "سفارش DB-14040512 وارد مرحله رست و بسته‌بندی شد.",
    date: "۱۴۰۴/۰۵/۱۳",
    read: false,
    href: "/account/orders/DB-14040512",
  },
  {
    id: "n-002",
    kind: "offer",
    title: "۱۰٪ تخفیف روی قهوه‌های فیلتر",
    body: "تا پایان هفته با کد FILTER20 روی لات‌های تک‌خاستگاه صرفه‌جویی کنید.",
    date: "۱۴۰۴/۰۵/۱۰",
    read: false,
    href: "/shop?category=specialty",
  },
  {
    id: "n-003",
    kind: "stock",
    title: "پاناما گیشا دوباره موجود شد",
    body: "لات جدید برداشت امسال با تعداد محدود در فروشگاه قرار گرفت.",
    date: "۱۴۰۴/۰۵/۰۶",
    read: false,
    href: "/product/panama-geisha",
  },
  {
    id: "n-004",
    kind: "order",
    title: "سفارش شما تحویل پست شد",
    body: "کد رهگیری سفارش DB-14040428 برای شما پیامک شد.",
    date: "۱۴۰۴/۰۴/۳۰",
    read: true,
    href: "/account/orders/DB-14040428",
  },
  {
    id: "n-005",
    kind: "account",
    title: "شماره موبایل شما تأیید شد",
    body: "از این پس می‌توانید سفارش‌ها و نشانی‌های خود را مدیریت کنید.",
    date: "۱۴۰۴/۰۴/۱۸",
    read: true,
  },
  {
    id: "n-006",
    kind: "offer",
    title: "اشتراک ماهانه دربند",
    body: "با فعال‌سازی اشتراک، هر ماه یک خاستگاه تازه دریافت کنید.",
    date: "۱۴۰۴/۰۴/۰۲",
    read: true,
    href: "/#subscription",
  },
];

export const defaultNotificationPrefs: NotificationPrefs = {
  orderSms: true,
  offers: true,
  newsletter: false,
};

/* ============================ Provinces / cities ========================== */

/** Deliberately a short, structured subset — not a full Iranian city dataset. */
export const provinces: { name: string; cities: string[] }[] = [
  { name: "تهران", cities: ["تهران", "کرج", "شهریار", "اسلامشهر", "ورامین"] },
  { name: "اصفهان", cities: ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر"] },
  { name: "فارس", cities: ["شیراز", "مرودشت", "کازرون", "جهرم"] },
  { name: "خراسان رضوی", cities: ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه"] },
  { name: "آذربایجان شرقی", cities: ["تبریز", "مراغه", "مرند", "اهر"] },
  { name: "گیلان", cities: ["رشت", "انزلی", "لاهیجان", "آستارا"] },
  { name: "خوزستان", cities: ["اهواز", "آبادان", "دزفول", "بهبهان"] },
  { name: "یزد", cities: ["یزد", "میبد", "اردکان"] },
];

export const orderStatusLabels: Record<string, string> = {
  "awaiting-payment": "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};
