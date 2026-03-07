import prisma from "../lib/prisma.js";

const findAll = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const findById = async (id: string) => {
  const productById = await prisma.category.findUnique({ where: { id } });

  return productById;
};

const findBySlug = async (slug: string) => {
  const categoryBySlug = await prisma.category.findUnique({ where: { slug } });

  return categoryBySlug;
};

const findByIdOrSlug = async (param: string) => {
  const category = await prisma.category.findFirst({
    where: { OR: [{ id: param }, { slug: param }] },
  });

  return category;
};

export const categoryRepo = {
  findAll,
  findById,
  findBySlug,
  findByIdOrSlug,
};
