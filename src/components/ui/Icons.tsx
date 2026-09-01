import type { SVGProps } from "react";

/**
 * Hand-rolled icon set (1.5px stroke, 24px grid).
 * Avoids shipping an icon library for ~20 glyphs.
 */

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  const { filled, ...rest } = props;
  void filled;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Base>
);

export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Base>
);

export const BagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 1 1 6 0v2" />
  </Base>
);

export const HeartIcon = ({ filled, ...p }: IconProps) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7C19 15.6 12 20 12 20Z" />
  </Base>
);

export const StarIcon = ({ filled, ...p }: IconProps) => (
  <Base {...p} fill={filled ? "currentColor" : "none"}>
    <path d="m12 4 2.3 4.8 5.2.7-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L4.5 9.5l5.2-.7L12 4Z" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 6l-6 6 6 6" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 6l6 6-6 6" />
  </Base>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Base>
);

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const MinusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Base>
);

export const InfoIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Base>
);

export const FilterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Base>
);

export const SortIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4v16M7 20l-3-3M17 20V4M17 4l3 3" />
  </Base>
);

export const TruckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </Base>
);

export const LeafIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4c0 9-5.5 14-11 14a5 5 0 0 1-5-5C4 8 11 4 20 4Z" />
    <path d="M4 20c4-6 8-9 13-11" />
  </Base>
);

export const BeanIcon = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="12" cy="12" rx="6.5" ry="8.5" transform="rotate(35 12 12)" />
    <path d="M8.4 16.2c2.4-2 3.5-6 2.9-9.1" />
  </Base>
);

export const FlameIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-2 1-3.4 2-4.5.3 1.4 1 2.2 1.8 2.2C12.4 9.7 12 6.4 12 3Z" />
  </Base>
);

export const ZoomIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5M11 8.5v5M8.5 11h5" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const RefreshIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4h-4" />
  </Base>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const ArrowUpLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 18 6 6M6 14V6h8" />
  </Base>
);

export const SparkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Base>
);

/* ------------------------------- Social ---------------------------------- */

export const InstagramIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M16.8 7.2h.01" />
  </Base>
);

export const TelegramIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m21 5-3 14-5-4-3 3v-4.5L19 7l-11 5-5-1.5L21 5Z" />
  </Base>
);

export const LinkedinIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 10.5V17M8 7.5v.01M12 17v-3.6a2 2 0 0 1 4 0V17" />
  </Base>
);

export const YoutubeIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="12" rx="4" />
    <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" />
  </Base>
);

export const socialIcons = {
  instagram: InstagramIcon,
  telegram: TelegramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};
