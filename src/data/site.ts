import type { BrewMethod, RoastLevel } from "@/types";

/** Brand + navigation content. Static content layer. */

export const brand = {
  name: "دربند",
  latinName: "DARBAND",
  tagline: "رستری قهوه‌های تخصصی",
  claim: "هر فنجان، روایت یک دانه",
  description:
    "دربند یک رستری مستقل قهوه‌های تخصصی است؛ ما دانه‌ها را مستقیم از مزارع منتخب تهیه می‌کنیم، در تهران رست می‌کنیم و در کمترین زمان ممکن به دست شما می‌رسانیم.",
  email: "hello@darband.coffee",
  phone: "۰۲۱ ۸۸۸۸ ۱۲۳۴",
  address: "تهران، خیابان ولیعصر، کوچه شهید مرادی، پلاک ۱۲",
  hours: "شنبه تا پنجشنبه، ۹ تا ۱۹",
  founded: "۱۳۹۶",
} as const;

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: { label: string; href: string; description?: string }[];
}

export const mainNav: NavItem[] = [
  {
    label: "فروشگاه",
    href: "/shop",
    children: [
      { label: "همه محصولات", href: "/shop", description: "کل کاتالوگ دربند" },
      { label: "قهوه دانه", href: "/shop?category=whole-bean", description: "تازه رست‌شده" },
      { label: "قهوه آسیاب‌شده", href: "/shop?category=ground", description: "آماده دم‌آوری" },
      { label: "کپسول قهوه", href: "/shop?category=capsule", description: "سازگار با نسپرسو" },
      { label: "محصولات هدیه", href: "/shop?category=gift", description: "بسته‌بندی ویژه" },
    ],
  },
  {
    label: "قهوه",
    href: "/shop?category=specialty",
    children: [
      { label: "قهوه تخصصی", href: "/shop?category=specialty", description: "امتیاز بالای ۸۵" },
      { label: "اسپرسو", href: "/shop?category=espresso", description: "کرمای پایدار" },
      { label: "ترکیبی", href: "/shop?category=blend", description: "امضای دربند" },
      { label: "بدون کافئین", href: "/shop?q=بدون کافئین", description: "فرآوری با آب" },
    ],
  },
  {
    label: "تجهیزات",
    href: "/shop?category=equipment",
    children: [
      { label: "آسیاب", href: "/shop?category=equipment", description: "دستی و برقی" },
      { label: "دریپر و کاراف", href: "/shop?category=equipment", description: "پور اور" },
      { label: "فیلتر و لوازم جانبی", href: "/shop?category=accessories", description: "مصرفی روزمره" },
    ],
  },
  { label: "ژورنال", href: "/journal" },
  { label: "درباره ما", href: "/about" },
];

export const footerNav: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "فروشگاه",
    links: [
      { label: "قهوه دانه", href: "/shop?category=whole-bean" },
      { label: "قهوه آسیاب‌شده", href: "/shop?category=ground" },
      { label: "اسپرسو", href: "/shop?category=espresso" },
      { label: "قهوه تخصصی", href: "/shop?category=specialty" },
      { label: "کپسول", href: "/shop?category=capsule" },
      { label: "تجهیزات", href: "/shop?category=equipment" },
      { label: "هدیه", href: "/shop?category=gift" },
    ],
  },
  {
    title: "راهنمای خرید",
    links: [
      { label: "قهوه‌ات را پیدا کن", href: "/#coffee-finder" },
      { label: "راهنمای دم‌آوری", href: "/journal?category=راهنمای دم‌آوری" },
      { label: "اشتراک ماهانه", href: "/#subscription" },
      { label: "شیوه ارسال", href: "/shipping" },
      { label: "بازگشت کالا", href: "/returns" },
      { label: "پرسش‌های پرتکرار", href: "/faq" },
    ],
  },
  {
    title: "دربند",
    links: [
      { label: "درباره ما", href: "/about" },
      { label: "ژورنال قهوه", href: "/journal" },
      { label: "همکاری با کافه‌ها", href: "/wholesale" },
      { label: "تماس با ما", href: "/contact" },
      { label: "فرصت‌های شغلی", href: "/careers" },
    ],
  },
];

export const legalLinks = [
  { label: "قوانین و مقررات", href: "/terms" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "شرایط بازگشت", href: "/returns" },
];

export const socialLinks = [
  { label: "اینستاگرام", href: "https://instagram.com", icon: "instagram" as const },
  { label: "تلگرام", href: "https://telegram.org", icon: "telegram" as const },
  { label: "لینکدین", href: "https://linkedin.com", icon: "linkedin" as const },
  { label: "یوتیوب", href: "https://youtube.com", icon: "youtube" as const },
];

/* ------------------------------ Coffee Finder ---------------------------- */

export interface FinderQuestion {
  id: "brew" | "flavor" | "intensity" | "acidity" | "usage";
  question: string;
  hint: string;
  options: { id: string; label: string; description: string }[];
}

export const finderQuestions: FinderQuestion[] = [
  {
    id: "brew",
    question: "معمولاً چطور قهوه دم می‌کنی؟",
    hint: "روش دم‌آوری، درجه آسیاب و پروفایل مناسب را تعیین می‌کند.",
    options: [
      { id: "espresso", label: "اسپرسوساز", description: "شات، لاته، کاپوچینو" },
      { id: "v60", label: "پور اور / وی‌۶۰", description: "دم‌آوری دستی و شفاف" },
      { id: "french-press", label: "فرنچ‌پرس", description: "ساده و پرقدرت" },
      { id: "moka", label: "موکاپات", description: "روش خانگی کلاسیک" },
    ],
  },
  {
    id: "flavor",
    question: "کدام خانواده طعمی را بیشتر دوست داری؟",
    hint: "این انتخاب خاستگاه پیشنهادی را مشخص می‌کند.",
    options: [
      { id: "fruity", label: "میوه‌ای و گلی", description: "لیمو، توت، یاس" },
      { id: "chocolate", label: "شکلاتی و آجیلی", description: "کاکائو، فندق، کارامل" },
      { id: "sweet", label: "شیرین و کاراملی", description: "عسل، تافی، خرما" },
      { id: "spicy", label: "ادویه‌ای و دودی", description: "دارچین، چوب، کاکائو تلخ" },
    ],
  },
  {
    id: "intensity",
    question: "چقدر قهوه‌ات قوی باشد؟",
    hint: "شدت به بدنه و میزان رست مربوط است.",
    options: [
      { id: "low", label: "سبک", description: "لطیف و ظریف" },
      { id: "medium", label: "متعادل", description: "میانه‌رو و روزمره" },
      { id: "high", label: "قوی", description: "بدنه سنگین و پرقدرت" },
    ],
  },
  {
    id: "acidity",
    question: "اسیدیته را دوست داری؟",
    hint: "اسیدیته همان درخشندگی و ترشی مطبوع فنجان است.",
    options: [
      { id: "low", label: "کم", description: "نرم و ملایم" },
      { id: "medium", label: "متوسط", description: "متعادل" },
      { id: "high", label: "زیاد", description: "زنده و درخشان" },
    ],
  },
  {
    id: "usage",
    question: "مصرفت روزمره است یا حرفه‌ای؟",
    hint: "این پاسخ روی حجم بسته و قیمت پیشنهادی اثر می‌گذارد.",
    options: [
      { id: "daily", label: "روزمره", description: "هر روز، بی‌دردسر" },
      { id: "pro", label: "حرفه‌ای", description: "دنبال بهترین لات‌ها" },
    ],
  },
];

export const finderBrewMap: Record<string, BrewMethod> = {
  espresso: "espresso",
  v60: "v60",
  "french-press": "french-press",
  moka: "moka",
};

export const finderFlavorMap: Record<string, string[]> = {
  fruity: ["گل محمدی", "لیمو", "انگور سیاه", "گریپ‌فروت", "هلو", "یاس", "برگاموت", "سیب قرمز"],
  chocolate: ["شکلات تلخ", "شکلات شیری", "کاکائو", "فندق", "بادام", "گردو", "کاکائو تلخ"],
  sweet: ["کارامل", "عسل", "تافی", "خرما", "نی‌شکر", "کارامل شور"],
  spicy: ["دارچین", "چوب دودی", "پرتقال خشک", "نان برشته"],
};

export const finderRoastMap: Record<string, RoastLevel[]> = {
  low: ["light"],
  medium: ["medium", "light"],
  high: ["medium-dark", "dark"],
};

/* ----------------------------- Brewing guides ---------------------------- */

export const brewingGuides = [
  {
    id: "espresso",
    title: "اسپرسو",
    time: "۳۰ ثانیه",
    ratio: "۱ به ۲",
    grind: "خیلی ریز",
    temperature: "۹۳ درجه",
    steps: [
      "۱۸ گرم قهوه را در پرتافیلتر توزیع و تمپ کنید.",
      "دستگاه را روشن کنید و خروجی را روی ترازو بگیرید.",
      "۳۶ تا ۴۰ گرم خروجی در ۲۶ تا ۳۰ ثانیه هدف شماست.",
    ],
  },
  {
    id: "v60",
    title: "وی‌۶۰",
    time: "۲:۴۵ دقیقه",
    ratio: "۱ به ۱۶",
    grind: "متوسط‌ریز",
    temperature: "۹۲ تا ۹۴ درجه",
    steps: [
      "فیلتر را با آب داغ شست‌وشو دهید تا طعم کاغذ برود.",
      "۳۰ گرم آب برای بلوم بریزید و ۴۰ ثانیه صبر کنید.",
      "در دو یا سه مرحله تا ۲۵۰ گرم آب اضافه کنید.",
    ],
  },
  {
    id: "french-press",
    title: "فرنچ‌پرس",
    time: "۴ دقیقه",
    ratio: "۱ به ۱۵",
    grind: "درشت",
    temperature: "۹۴ درجه",
    steps: [
      "قهوه درشت‌آسیاب را در ظرف بریزید و آب داغ اضافه کنید.",
      "۴ دقیقه صبر کنید، سپس کف سطح را کنار بزنید.",
      "پیستون را آرام پایین ببرید و بلافاصله سرو کنید.",
    ],
  },
  {
    id: "aeropress",
    title: "ایروپرس",
    time: "۱:۳۰ دقیقه",
    ratio: "۱ به ۱۴",
    grind: "متوسط",
    temperature: "۸۵ تا ۹۰ درجه",
    steps: [
      "۱۵ گرم قهوه و ۲۱۰ گرم آب را اضافه کنید و ۱۰ بار هم بزنید.",
      "۱ دقیقه صبر کنید و درپوش فیلتر را ببندید.",
      "در ۳۰ ثانیه به آرامی فشار دهید.",
    ],
  },
];

/* ----------------------------- Search presets ---------------------------- */

export const popularSearches = [
  "اتیوپی",
  "اسپرسو",
  "قهوه بدون کافئین",
  "آسیاب دستی",
  "جعبه هدیه",
  "کپسول",
];

export const brandValues = [
  {
    title: "تهیه مستقیم",
    description:
      "بدون واسطه با تعاونی‌ها و مزارع کار می‌کنیم و قیمت خرید ما همیشه بالاتر از نرخ بورس قهوه است.",
  },
  {
    title: "رست در روز سفارش",
    description:
      "هیچ بسته‌ای بیش از ۴۸ ساعت در انبار نمی‌ماند؛ تاریخ رست روی هر بسته چاپ می‌شود.",
  },
  {
    title: "شفافیت کامل",
    description:
      "نام مزرعه، ارتفاع، واریته و روش فرآوری هر لات را منتشر می‌کنیم؛ هیچ چیز پنهان نیست.",
  },
  {
    title: "بسته‌بندی مسئولانه",
    description:
      "بسته‌های ما قابل بازیافت‌اند و جعبه‌های ارسال از مقوای بازیافتی ساخته می‌شوند.",
  },
];

export const aboutTimeline = [
  { year: "۱۳۹۶", title: "یک رستر ۵ کیلویی", text: "کار را در زیرزمینی در دربند با یک رستر کوچک و سه مشتری شروع کردیم." },
  { year: "۱۳۹۸", title: "اولین سفر خاستگاه", text: "به اتیوپی رفتیم و اولین قرارداد مستقیم‌مان را با ایستگاه شست‌وشوی کوچره بستیم." },
  { year: "۱۴۰۱", title: "رست‌خانه جدید", text: "به رست‌خانه‌ای ۴۰۰ متری با رستر ۱۵ کیلویی و آزمایشگاه کاپینگ نقل‌مکان کردیم." },
  { year: "۱۴۰۴", title: "۴۰ کافه، ۹۰۰۰ خانه", text: "امروز قهوه دربند در بیش از ۴۰ کافه سرو می‌شود و هر ماه به هزاران خانه می‌رسد." },
];
