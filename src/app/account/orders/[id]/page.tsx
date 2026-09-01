import type { Metadata } from "next";
import { mockOrders } from "@/data/mock-user";
import { OrderDetailView } from "@/features/account/OrderDetailView";

/**
 * Mock orders are a fixed set, so every detail page is prerendered and any
 * unknown id falls through to the site-wide 404 page instead of being
 * server-rendered on demand.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return mockOrders.map((order) => ({ id: order.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `سفارش ${id}`,
    description: "جزئیات، کالاها و وضعیت ارسال سفارش.",
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
