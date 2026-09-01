import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInfoPage, infoPages } from "@/data/pages";
import { Accordion, Breadcrumb } from "@/components/ui/Disclosure";
import { brand } from "@/data/site";
import { MailIcon, PhoneIcon, PinIcon, ClockIcon } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";

type Params = Promise<{ page: string }>;

export function generateStaticParams() {
  return infoPages.map((p) => ({ page: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { page } = await params;
  const info = getInfoPage(page);
  if (!info) return { title: "صفحه پیدا نشد" };
  return {
    title: info.title,
    description: info.metaDescription,
    alternates: { canonical: `/${info.slug}` },
  };
}

export default async function InfoRoute({ params }: { params: Params }) {
  const { page } = await params;
  const info = getInfoPage(page);
  if (!info) notFound();

  return (
    <>
      <div className="border-b border-beige-300/60 bg-cream-50">
        <div className="container-page py-10 lg:py-14">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: info.title }]} />
          <h1 className="mt-4 text-3xl font-black text-espresso-900 sm:text-4xl">{info.title}</h1>
          <p className="mt-3 max-w-2xl text-sm/7 text-ash-600">{info.intro}</p>
        </div>
      </div>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_20rem] lg:py-16">
        <article className="max-w-2xl">
          {info.asAccordion ? (
            <Accordion
              defaultOpen={info.sections[0]?.heading}
              items={info.sections.map((s) => ({
                id: s.heading,
                title: s.heading,
                content: (
                  <div className="space-y-3">
                    {s.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {s.bullets && (
                      <ul className="list-disc space-y-1.5 ps-5">
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              }))}
            />
          ) : (
            info.sections.map((section) => (
              <section key={section.heading} className="mb-9">
                <h2 className="mb-3 text-xl font-bold text-espresso-900">{section.heading}</h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="mb-3 text-[0.95rem]/8 text-ash-600">
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-[0.95rem]/8 text-ash-600"
                      >
                        <span
                          className="mt-3 size-1.5 shrink-0 rounded-full bg-accent-500"
                          aria-hidden="true"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))
          )}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-cream-100/70 p-6">
            <h2 className="text-base font-bold text-espresso-900">ارتباط با دربند</h2>
            <ul className="mt-4 space-y-3 text-sm text-ash-600">
              <li className="flex items-start gap-2.5">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-accent-600" />
                {brand.address}
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="size-4 shrink-0 text-accent-600" />
                <a href="tel:+982188881234" className="hover:text-espresso-900">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="size-4 shrink-0 text-accent-600" />
                <a href={`mailto:${brand.email}`} className="latin hover:text-espresso-900">
                  {brand.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <ClockIcon className="size-4 shrink-0 text-accent-600" />
                {brand.hours}
              </li>
            </ul>
            <ButtonLink href="/shop" fullWidth className="mt-6">
              رفتن به فروشگاه
            </ButtonLink>
          </div>
        </aside>
      </div>
    </>
  );
}
