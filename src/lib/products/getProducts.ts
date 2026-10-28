import type { Prisma } from "@/generated/prisma/browser";
import { PRODUCTS_PAGE_SIZE } from "./constants";
import { calculateSkip } from "./pagination";
import type { ProductFilters, PaginatedProducts } from "./types";
import prisma from "../prisma";
import { cacheLife, cacheTag } from "next/cache";

export async function getProducts(
  filters: ProductFilters,
  currentPage: number,
): Promise<PaginatedProducts> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const { query, category, sort } = filters;
  const skip = calculateSkip(currentPage, PRODUCTS_PAGE_SIZE);

  const where: Prisma.ProductWhereInput = {
    ...(query && {
      title: {
        contains: query,
        mode: "insensitive",
      },
    }),
    ...(category && {
      category,
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput | undefined =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : undefined;

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: PRODUCTS_PAGE_SIZE,
  });

  const total = await prisma.product.count({ where });

  return {
    products,
    total,
  };
}
