import type { Product } from "./types";
import prisma from "../prisma";
import { cacheLife, cacheTag } from "next/cache";

export default async function getProduct(id: string): Promise<Product | null> {
  "use cache";
  const normalizedId = Number(id);

  if (!Number.isInteger(normalizedId) || normalizedId < 1) {
    return null;
  }

  cacheLife("hours");
  cacheTag(`product-${normalizedId}`);

  return prisma.product.findUnique({
    where: {
      id: normalizedId,
    },
  });
}
