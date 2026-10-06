import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  basePrice: true,
  soldCount: true,
  rating: true,
  ratingCount: true,
  images: {
    select: { url: true, alt: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
  store: {
    select: { id: true, name: true, slug: true, city: true, status: true },
  },
  variants: {
    select: { id: true, price: true, compareAtPrice: true },
    where: { isActive: true, stock: { gt: 0 } },
  },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Awaited<
  ReturnType<typeof prisma.product.findMany<{ select: typeof productCardSelect }>>
>[number];

export type ProductListParams = {
  query?: string;
  category?: string;
  storeId?: string;
  sort?: "terbaru" | "terlaris" | "termurah" | "termahal" | "rating";
  page?: number;
  perPage?: number;
};

export const PRODUCT_PER_PAGE = 12;

export async function listProducts(params: ProductListParams = {}) {
  const {
    query,
    category,
    storeId,
    sort = "terbaru",
    page = 1,
    perPage = PRODUCT_PER_PAGE,
  } = params;

  const where = {
    status: "ACTIVE" as const,
    ...(storeId ? { storeId } : {}),
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "terlaris"
      ? [{ soldCount: "desc" as const }, { id: "asc" as const }]
      : sort === "termurah"
        ? [{ basePrice: "asc" as const }, { id: "asc" as const }]
        : sort === "termahal"
          ? [{ basePrice: "desc" as const }, { id: "asc" as const }]
          : sort === "rating"
            ? [{ rating: "desc" as const }, { ratingCount: "desc" as const }]
            : [{ createdAt: "desc" as const }, { id: "asc" as const }];

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productCardSelect,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      basePrice: true,
      options: true,
      soldCount: true,
      viewCount: true,
      rating: true,
      ratingCount: true,
      createdAt: true,
      store: { select: { id: true, name: true, slug: true, city: true } },
      images: {
        select: { id: true, url: true, alt: true, isPrimary: true },
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          name: true,
          options: true,
          price: true,
          compareAtPrice: true,
          stock: true,
          weightGrams: true,
          isActive: true,
        },
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function getProductByIdForSeller(productId: string, storeId: string) {
  return prisma.product.findFirst({
    where: { id: productId, storeId },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      status: true,
      options: true,
      basePrice: true,
      images: { select: { id: true, url: true, sortOrder: true, isPrimary: true } },
      variants: {
        select: {
          id: true,
          sku: true,
          name: true,
          options: true,
          price: true,
          compareAtPrice: true,
          stock: true,
          isActive: true,
        },
      },
    },
  });
}

export async function getHomeData() {
  const [newest, bestSeller, categories, stores] = await Promise.all([
    listProducts({ sort: "terbaru", perPage: 8 }),
    listProducts({ sort: "terlaris", perPage: 4 }),
    prisma.product.findMany({
      where: { status: "ACTIVE", category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
    prisma.store.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        logoUrl: true,
        rating: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { rating: "desc" },
      take: 4,
    }),
  ]);

  return {
    newest: newest.items,
    bestSeller: bestSeller.items,
    categories: categories
      .map((row) => row.category)
      .filter((value): value is string => Boolean(value)),
    stores,
  };
}

export async function getActiveStores() {
  return prisma.store.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      city: true,
      rating: true,
      ratingCount: true,
      createdAt: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
    orderBy: { ratingCount: "desc" },
  });
}

export async function getStoreBySlug(slug: string) {
  return prisma.store.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      city: true,
      rating: true,
      ratingCount: true,
      createdAt: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });
}
