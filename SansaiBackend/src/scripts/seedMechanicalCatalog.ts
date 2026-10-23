import { pool, prisma } from "../prisma/prisma";

const categories = [
  { name: "HSS Drill Bits", slug: "hss-drill-bits", description: "High-speed steel parallel-shank drill bits for precise drilling in metal, wood and plastic.", image: "/images/drill-bits/hss-drill-bit.png" },
  { name: "Flat Wood Drill Bits", slug: "flat-wood-drill-bits", description: "Fast-cutting spade bits for clean holes in natural and engineered wood.", image: "/images/drill-bits/flat-wood-drill-bit.png" },
  { name: "Masonry Drill Bits", slug: "masonry-drill-bits", description: "Carbide-tipped drill bits for brick, block, concrete and stone.", image: "/images/drill-bits/masonry-drill-bit.png" },
  { name: "Glass & Tile Drill Bits", slug: "glass-and-tile-drill-bits", description: "Spear-head drill bits for controlled drilling in glass, ceramic and tile.", image: "/images/drill-bits/glass-tile-drill-bits.png" },
  { name: "Hand Taps", slug: "hand-taps", description: "Precision HSS hand taps for cutting clean internal threads.", image: "/images/drill-bits/hand-taps.png" },
] as const;

type ProductSeed = {
  category: string; name: string; slug: string; sku: string; price: number;
  stock: number; size: string; material: string; image: string;
};

const hssSizes = [
  ["2mm", 44], ["2.5mm", 44], ["3mm", 48], ["3.5mm", 58],
  ["4mm", 82], ["5mm", 142], ["6mm", 185], ["8mm", 295],
] as const;

const products: ProductSeed[] = [
  ...hssSizes.map(([size, price], index) => ({
    category: "hss-drill-bits",
    name: `${size} HSS Parallel Shank Drill Bit`,
    slug: `${size.replace(".", "-")}-hss-parallel-shank-drill-bit`,
    sku: `HSS-${size.replace(".", "")}-PS`,
    price,
    stock: 40 - index * 2,
    size,
    material: "High Speed Steel",
    image: "/images/drill-bits/hss-drill-bit.png",
  })),
  { category: "flat-wood-drill-bits", name: "10mm Flat Wood Spade Drill Bit", slug: "10mm-flat-wood-spade-drill-bit", sku: "FWD-10", price: 95, stock: 28, size: "10mm", material: "Hardened Carbon Steel", image: "/images/drill-bits/flat-wood-drill-bit.png" },
  { category: "flat-wood-drill-bits", name: "16mm Flat Wood Spade Drill Bit", slug: "16mm-flat-wood-spade-drill-bit", sku: "FWD-16", price: 125, stock: 24, size: "16mm", material: "Hardened Carbon Steel", image: "/images/drill-bits/flat-wood-drill-bit.png" },
  { category: "masonry-drill-bits", name: "6mm Carbide Tip Masonry Drill Bit", slug: "6mm-carbide-tip-masonry-drill-bit", sku: "MDB-06", price: 110, stock: 30, size: "6mm", material: "Carbide Tipped Steel", image: "/images/drill-bits/masonry-drill-bit.png" },
  { category: "masonry-drill-bits", name: "10mm Carbide Tip Masonry Drill Bit", slug: "10mm-carbide-tip-masonry-drill-bit", sku: "MDB-10", price: 180, stock: 26, size: "10mm", material: "Carbide Tipped Steel", image: "/images/drill-bits/masonry-drill-bit.png" },
  { category: "glass-and-tile-drill-bits", name: "6mm Glass & Tile Spear Drill Bit", slug: "6mm-glass-tile-spear-drill-bit", sku: "GTD-06", price: 165, stock: 22, size: "6mm", material: "Tungsten Carbide", image: "/images/drill-bits/glass-tile-drill-bits.png" },
  { category: "glass-and-tile-drill-bits", name: "10mm Glass & Tile Spear Drill Bit", slug: "10mm-glass-tile-spear-drill-bit", sku: "GTD-10", price: 225, stock: 20, size: "10mm", material: "Tungsten Carbide", image: "/images/drill-bits/glass-tile-drill-bits.png" },
  { category: "hand-taps", name: "M4 HSS Hand Tap Set", slug: "m4-hss-hand-tap-set", sku: "TAP-M4", price: 240, stock: 18, size: "M4", material: "High Speed Steel", image: "/images/drill-bits/hand-taps.png" },
  { category: "hand-taps", name: "M6 HSS Hand Tap Set", slug: "m6-hss-hand-tap-set", sku: "TAP-M6", price: 290, stock: 18, size: "M6", material: "High Speed Steel", image: "/images/drill-bits/hand-taps.png" },
];

async function main() {
  // Add missing fixtures atomically; preserve existing catalog edits and stock.
  await prisma.$transaction(async (tx) => {
    const categoryIds = new Map<string, number>();

    for (const [displayOrder, item] of categories.entries()) {
      const category = await tx.category.upsert({
        where: { slug: item.slug },
        update: {},
        create: { ...item, isActive: true, displayOrder },
      });
      categoryIds.set(item.slug, category.id);
    }

    for (const item of products) {
      const categoryId = categoryIds.get(item.category);
      if (!categoryId) throw new Error(`Missing category for ${item.name}`);
      const description = `${item.name} made from ${item.material}. Suitable for workshop, trade and DIY drilling.`;

      await tx.product.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          categoryId, name: item.name, slug: item.slug, description, shortDescription: description,
          brand: "sensai", sku: item.sku, material: item.material, finish: "Bright",
          dimensions: item.size, basePrice: item.price, packQuantity: 1, unitOfMeasure: "piece",
          isActive: true, isFeatured: true, isBestSeller: item.category === "hss-drill-bits", isNewArrival: true,
          images: {
            create: { imageUrl: item.image, altText: item.name, isPrimary: true, displayOrder: 0 },
          },
          variants: {
            create: { size: item.size, color: "Steel", sku: `${item.sku}-STD`, price: item.price, stock: item.stock },
          },
        },
      });
    }
  }, { timeout: 30_000 });

  console.log(`Dummy catalog ready: ${categories.length} categories and ${products.length} products. Existing records preserved.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
