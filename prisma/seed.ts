import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const tshirts = await prisma.category.upsert({
    where: { slug: "tshirts" },
    update: {},
    create: {
      name: "T-Shirts",
      slug: "tshirts",
      description: "Premium cotton tees for everyday streetwear.",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
    },
  });

  const hoodies = await prisma.category.upsert({
    where: { slug: "hoodies" },
    update: {},
    create: {
      name: "Hoodies",
      slug: "hoodies",
      description: "Heavyweight fleece hoodies built for comfort.",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
    },
  });

  const shorts = await prisma.category.upsert({
    where: { slug: "shorts" },
    update: {},
    create: {
      name: "Shorts",
      slug: "shorts",
      description: "Athletic and casual shorts for every occasion.",
      image:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=400&fit=crop",
    },
  });

  const caps = await prisma.category.upsert({
    where: { slug: "caps" },
    update: {},
    create: {
      name: "Caps",
      slug: "caps",
      description: "Classic caps and headwear to complete your fit.",
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=400&fit=crop",
    },
  });

  console.log("Categories seeded:", { tshirts, hoodies, shorts, caps });

  // Seed products
  const products = [
    {
      name: "Essential Cotton Tee",
      description:
        "A timeless classic made from 100% organic cotton. Perfect for everyday wear with a relaxed fit and breathable fabric.",
      price: 29.99,
      categoryId: tshirts.id,
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["White", "Black", "Navy", "Gray"],
      featured: true,
      stock: 150,
    },
    {
      name: "Minimalist Logo Tee",
      description:
        "Clean design with subtle branding. Made from premium cotton blend for superior comfort and durability.",
      price: 34.99,
      categoryId: tshirts.id,
      image:
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Sage"],
      featured: false,
      stock: 80,
    },
    {
      name: "Oversized Street Tee",
      description:
        "Contemporary oversized fit with dropped shoulders. Perfect for a modern streetwear aesthetic.",
      price: 39.99,
      categoryId: tshirts.id,
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Cream", "Charcoal", "Olive"],
      featured: true,
      stock: 65,
    },
    {
      name: "Vintage Wash Tee",
      description:
        "Pre-washed for that lived-in feel. Soft, comfortable, and gets better with every wash.",
      price: 32.99,
      categoryId: tshirts.id,
      image:
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Faded Blue", "Dusty Pink", "Washed Black"],
      featured: false,
      stock: 95,
    },
    {
      name: "Premium Fleece Hoodie",
      description:
        "Ultra-soft fleece interior with a modern silhouette. Features kangaroo pocket and adjustable drawstring hood.",
      price: 79.99,
      categoryId: hoodies.id,
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "Heather Gray", "Navy"],
      featured: true,
      stock: 120,
    },
    {
      name: "Heavyweight Champion Hoodie",
      description:
        "Built for durability with heavyweight cotton. Double-stitched seams and ribbed cuffs for lasting quality.",
      price: 89.99,
      categoryId: hoodies.id,
      image:
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop",
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Forest Green", "Burgundy", "Stone"],
      featured: false,
      stock: 55,
    },
    {
      name: "Zip-Up Essential Hoodie",
      description:
        "Versatile full-zip design with split kangaroo pockets. Perfect layering piece for any season.",
      price: 74.99,
      categoryId: hoodies.id,
      image:
        "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Black", "Cream", "Slate Blue"],
      featured: true,
      stock: 88,
    },
    {
      name: "Athletic Performance Shorts",
      description:
        "Lightweight and breathable with moisture-wicking technology. Built-in brief liner for comfort during workouts.",
      price: 44.99,
      categoryId: shorts.id,
      image:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Gray"],
      featured: true,
      stock: 100,
    },
    {
      name: "Classic Chino Shorts",
      description:
        "Tailored fit with a 7-inch inseam. Perfect for casual outings with a refined look.",
      price: 54.99,
      categoryId: shorts.id,
      image:
        "https://images.unsplash.com/photo-1617952385804-7b326fa0b291?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Khaki", "Navy", "Olive", "White"],
      featured: false,
      stock: 75,
    },
    {
      name: "Terry Cloth Lounge Shorts",
      description:
        "Ultimate comfort in premium terry fabric. Elastic waistband with drawstring for the perfect fit.",
      price: 49.99,
      categoryId: shorts.id,
      image:
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Sand", "Sky Blue", "Coral"],
      featured: true,
      stock: 60,
    },
    {
      name: "Classic Baseball Cap",
      description:
        "Timeless 6-panel design with adjustable strap. Pre-curved brim with embroidered logo.",
      price: 24.99,
      categoryId: caps.id,
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop",
      sizes: ["One Size"],
      colors: ["Black", "Navy", "White", "Khaki"],
      featured: true,
      stock: 200,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name }, // will fail on first run, creating the product
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
