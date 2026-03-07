import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcrypt";

const connectionString = `${process.env.DEV_DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ Cleared existing data\n");

  // Seed test users
  const hashedPassword = await bcrypt.hash("password123", 12);

  const testUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✓ Users seeded:");
  console.log("  - test@example.com (password: password123)");
  console.log("  - admin@example.com (password: password123)\n");

  // Seed categories
  const tshirts = await prisma.category.create({
    data: {
      name: "T-Shirts",
      slug: "tshirts",
      description: "Premium cotton tees for everyday streetwear.",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
    },
  });

  const hoodies = await prisma.category.create({
    data: {
      name: "Hoodies",
      slug: "hoodies",
      description: "Heavyweight fleece hoodies built for comfort.",
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
    },
  });

  const shorts = await prisma.category.create({
    data: {
      name: "Shorts",
      slug: "shorts",
      description: "Athletic and casual shorts for every occasion.",
      image:
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=400&fit=crop",
    },
  });

  const caps = await prisma.category.create({
    data: {
      name: "Caps",
      slug: "caps",
      description: "Classic caps and headwear to complete your fit.",
      image:
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=400&fit=crop",
    },
  });

  const jackets = await prisma.category.create({
    data: {
      name: "Jackets",
      slug: "jackets",
      description: "Stylish outerwear for every season.",
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=400&fit=crop",
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: "Accessories",
      slug: "accessories",
      description: "Complete your look with premium accessories.",
      image:
        "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=600&h=400&fit=crop",
    },
  });

  console.log(
    "✓ Categories seeded: T-Shirts, Hoodies, Shorts, Caps, Jackets, Accessories\n",
  );

  // Seed products
  const products = [
    // T-Shirts
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
      name: "Graphic Print Tee",
      description:
        "Bold graphic designs printed on soft premium cotton. Make a statement with unique artwork.",
      price: 36.99,
      categoryId: tshirts.id,
      image:
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White"],
      featured: true,
      stock: 70,
    },
    // Hoodies
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
      name: "Cropped Hoodie",
      description:
        "Trendy cropped silhouette perfect for high-waisted bottoms. Soft brushed fleece interior.",
      price: 64.99,
      categoryId: hoodies.id,
      image:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Pink", "Lavender", "Black"],
      featured: false,
      stock: 45,
    },
    // Shorts
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
      name: "Cargo Utility Shorts",
      description:
        "Functional cargo pockets with durable construction. Perfect for outdoor adventures.",
      price: 59.99,
      categoryId: shorts.id,
      image:
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Olive", "Black", "Tan"],
      featured: false,
      stock: 40,
    },
    // Caps
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
    {
      name: "Snapback Premium Cap",
      description:
        "Flat brim snapback with premium embroidery. Structured crown with adjustable snap closure.",
      price: 34.99,
      categoryId: caps.id,
      image:
        "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&h=600&fit=crop",
      sizes: ["One Size"],
      colors: ["Black", "Red", "Royal Blue"],
      featured: true,
      stock: 120,
    },
    {
      name: "Dad Hat Washed",
      description:
        "Relaxed unstructured fit with vintage washed finish. Ultimate comfort for everyday wear.",
      price: 27.99,
      categoryId: caps.id,
      image:
        "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=600&fit=crop",
      sizes: ["One Size"],
      colors: ["Washed Black", "Washed Denim", "Stone"],
      featured: false,
      stock: 90,
    },
    // Jackets
    {
      name: "Bomber Jacket Classic",
      description:
        "Iconic bomber silhouette with ribbed collar and cuffs. Lightweight fill for transitional weather.",
      price: 129.99,
      categoryId: jackets.id,
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Olive", "Navy"],
      featured: true,
      stock: 50,
    },
    {
      name: "Denim Trucker Jacket",
      description:
        "Classic denim jacket with modern fit. Versatile layering piece for any season.",
      price: 99.99,
      categoryId: jackets.id,
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Light Wash", "Dark Wash", "Black"],
      featured: true,
      stock: 65,
    },
    {
      name: "Windbreaker Pullover",
      description:
        "Water-resistant pullover with half-zip design. Packable into front pocket for easy travel.",
      price: 84.99,
      categoryId: jackets.id,
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Red", "Yellow", "Black"],
      featured: false,
      stock: 75,
    },
    {
      name: "Puffer Vest",
      description:
        "Lightweight quilted vest with synthetic fill. Perfect for layering in cool weather.",
      price: 79.99,
      categoryId: jackets.id,
      image:
        "https://images.unsplash.com/photo-1544923246-77307dd628b5?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Navy", "Olive"],
      featured: false,
      stock: 35,
    },
    // Accessories
    {
      name: "Canvas Tote Bag",
      description:
        "Durable canvas construction with reinforced handles. Spacious interior for everyday essentials.",
      price: 39.99,
      categoryId: accessories.id,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
      sizes: ["One Size"],
      colors: ["Natural", "Black", "Navy"],
      featured: true,
      stock: 100,
    },
    {
      name: "Beanie Ribbed",
      description:
        "Soft ribbed knit beanie with cuffed design. Warm and comfortable for cold weather.",
      price: 24.99,
      categoryId: accessories.id,
      image:
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=600&fit=crop",
      sizes: ["One Size"],
      colors: ["Black", "Gray", "Burgundy", "Forest Green"],
      featured: true,
      stock: 150,
    },
    {
      name: "Leather Belt",
      description:
        "Genuine leather belt with brushed metal buckle. Classic design that pairs with everything.",
      price: 44.99,
      categoryId: accessories.id,
      image:
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=600&fit=crop",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown", "Black"],
      featured: false,
      stock: 80,
    },
    {
      name: "Crew Socks 3-Pack",
      description:
        "Premium cotton blend crew socks. Reinforced heel and toe for durability.",
      price: 19.99,
      categoryId: accessories.id,
      image:
        "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=600&fit=crop",
      sizes: ["S/M", "L/XL"],
      colors: ["White", "Black", "Mixed"],
      featured: false,
      stock: 200,
    },
  ];

  // Create all products
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✓ Seeded ${products.length} products\n`);

  // Create a sample order for the test user
  const sampleProduct = await prisma.product.findFirst();
  if (sampleProduct) {
    await prisma.order.create({
      data: {
        userId: testUser.id,
        total: 104.97,
        status: "DELIVERED",
        shippingName: "Test User",
        shippingAddress: "123 Test Street",
        shippingCity: "New York",
        shippingPostal: "10001",
        shippingCountry: "US",
        stripeSessionId: "cs_test_sample123",
        items: {
          create: [
            {
              productId: sampleProduct.id,
              quantity: 2,
              price: sampleProduct.price,
              size: "M",
              color: sampleProduct.colors[0] || "Black",
            },
          ],
        },
      },
    });
    console.log("✓ Sample order created for test user\n");
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("   User:  test@example.com / password123");
  console.log("   Admin: admin@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
