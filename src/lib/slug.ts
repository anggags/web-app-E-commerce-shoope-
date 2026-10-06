import { prisma } from "@/lib/prisma";

/**
 * Slug unik untuk model yang punya kolom `slug` unik (Product, Store).
 */
export async function createUniqueSlug(
  model: "product" | "store",
  source: string,
): Promise<string> {
  const base =
    source
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "item";

  const exists = async (candidate: string) => {
    const found =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } })
        : await prisma.store.findUnique({ where: { slug: candidate }, select: { id: true } });
    return Boolean(found);
  };

  if (!(await exists(base))) return base;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
