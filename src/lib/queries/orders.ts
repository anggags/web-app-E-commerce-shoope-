import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/enums";

export async function getBuyerOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      total: true,
      createdAt: true,
      store: { select: { name: true, slug: true } },
      items: { select: { id: true, productName: true, imageUrl: true, quantity: true } },
    },
  });
}

export async function getBuyerOrderByNumber(userId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber, userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentMethod: true,
      paymentStatus: true,
      subtotal: true,
      shippingFee: true,
      total: true,
      buyerNote: true,
      recipientName: true,
      shippingPhone: true,
      shippingAddress: true,
      courier: true,
      trackingNumber: true,
      createdAt: true,
      store: { select: { name: true, slug: true } },
      items: {
        select: {
          id: true,
          productName: true,
          variantName: true,
          imageUrl: true,
          price: true,
          quantity: true,
          subtotal: true,
          product: { select: { slug: true } },
        },
      },
    },
  });
}

export async function getSellerOrders(storeId: string, status?: string) {
  return prisma.order.findMany({
    where: {
      storeId,
      ...(status && status !== "all" ? { status: status as OrderStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      recipientName: true,
      total: true,
      trackingNumber: true,
      courier: true,
      createdAt: true,
      items: { select: { id: true, productName: true, imageUrl: true, quantity: true } },
    },
  });
}

export async function getSellerOrderByNumber(storeId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber, storeId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      recipientName: true,
      shippingPhone: true,
      shippingAddress: true,
      subtotal: true,
      shippingFee: true,
      total: true,
      buyerNote: true,
      courier: true,
      trackingNumber: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      items: { select: { id: true, productName: true, variantName: true, quantity: true, subtotal: true } },
    },
  });
}

export async function getSellerStats(storeId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalProducts,
    activeProducts,
    pendingProducts,
    awaitingShipment,
    shippedOrders,
    revenueAggregate,
    revenue30d,
    orderCount30d,
    lowStock,
  ] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.product.count({ where: { storeId, status: "ACTIVE" } }),
    prisma.product.count({ where: { storeId, status: "PENDING_REVIEW" } }),
    prisma.order.count({ where: { storeId, status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.order.count({ where: { storeId, status: "SHIPPED" } }),
    prisma.order.aggregate({
      where: { storeId, status: { not: "CANCELED" } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { storeId, status: { not: "CANCELED" }, createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { storeId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.productVariant.findMany({
      where: { product: { storeId }, stock: { lte: 5 }, isActive: true },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        name: true,
        stock: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    pendingProducts,
    awaitingShipment,
    shippedOrders,
    revenue: revenueAggregate._sum.total ?? 0,
    revenue30d: revenue30d._sum.total ?? 0,
    orderCount30d,
    lowStock,
  };
}
