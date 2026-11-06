import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  admins,
  categories,
  products,
  productImages,
  productVariants,
  productPrices,
  inventory,
  storeSettings,
  banners,
  coupons,
  reviews,
} from './schema.ts';
import { eq, sql } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if admins already seeded
    const existingAdmins = await db.select({ count: sql<number>`count(*)` }).from(admins);
    if (Number(existingAdmins[0]?.count || 0) > 0) {
      console.log('Database already seeded.');
      return;
    }

    console.log('Seeding database with default AURA FIT catalog, settings, admin, and banners...');

    // 1. Seed Default Admin (Password: aurafit2026!)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('aurafit2026!', salt);

    await db.insert(admins).values({
      email: 'admin@aurafit.store',
      name: 'Super Admin',
      passwordHash,
      role: 'superadmin',
      isActive: true,
    });

    // 2. Seed Store Settings
    const defaultSettings = [
      { key: 'store_name', value: 'AURA FIT' },
      { key: 'tagline', value: 'DEFINE YOUR STYLE. OWN YOUR AURA.' },
      { key: 'store_logo', value: '' }, // empty means text wordmark
      { key: 'contact_email', value: 'concierge@aurafit.store' },
      { key: 'contact_phone', value: '+91 98765 43210' },
      { key: 'whatsapp_number', value: '+91 98765 43210' },
      { key: 'store_address', value: 'AURA Studios, Sector 44, Bengaluru, Karnataka, 560038' },
      { key: 'free_shipping_threshold', value: 1999 },
      { key: 'standard_shipping_fee', value: 149 },
      { key: 'express_shipping_fee', value: 249 },
      { key: 'social_instagram', value: 'https://instagram.com/aurafit.apparel' },
      { key: 'social_twitter', value: 'https://x.com/aurafit_style' },
      { key: 'social_youtube', value: 'https://youtube.com/@aurafit' },
      { key: 'return_window_days', value: 14 },
      { key: 'return_policy', value: 'We offer a hassle-free 14-day return and exchange policy on all unworn items with original tags intact.' },
      { key: 'terms_and_conditions', value: 'All transactions are encrypted and secured. AURA FIT is a registered luxury apparel trademark.' },
    ];

    for (const s of defaultSettings) {
      await db.insert(storeSettings).values({
        key: s.key,
        value: s.value,
      }).onConflictDoNothing();
    }

    // 3. Seed Default Categories
    const categoryData = [
      // Men
      { name: 'Men Hoodies', slug: 'men-hoodies', gender: 'men', description: 'Heavyweight oversized hoodies tailored from 450GSM loopback cotton' },
      { name: 'Men Oversized T-Shirts', slug: 'men-oversized-t-shirts', gender: 'men', description: 'Drop-shoulder 280GSM combed cotton streetwear tees' },
      { name: 'Men T-Shirts', slug: 'men-t-shirts', gender: 'men', description: 'Essential premium minimalist tees' },
      { name: 'Men Jackets', slug: 'men-jackets', gender: 'men', description: 'Technical outerwear, bomber jackets, and wool overcoats' },
      { name: 'Men Trousers & Cargo', slug: 'men-trousers-cargo', gender: 'men', description: 'Relaxed fit architectural cargos and pleated tailored trousers' },
      { name: 'Men Jeans', slug: 'men-jeans', gender: 'men', description: 'Japanese raw selvedge denim in relaxed modern silhouettes' },
      { name: 'Men Shirts', slug: 'men-shirts', gender: 'men', description: 'Camp collar boxy shirts and structured overshirts' },
      { name: 'Men Sweatshirts', slug: 'men-sweatshirts', gender: 'men', description: 'Minimalist crewneck pullovers in vintage wash' },
      { name: 'Men Shorts', slug: 'men-shorts', gender: 'men', description: 'Heavyweight fleece and nylon utility cargo shorts' },

      // Women
      { name: 'Women Tops', slug: 'women-tops', gender: 'women', description: 'Sculptural rib-knit tops, corseted basics, and cropped tanks' },
      { name: 'Women T-Shirts', slug: 'women-t-shirts', gender: 'women', description: 'Boyfriend fit and cropped heavyweight tees' },
      { name: 'Women Hoodies', slug: 'women-hoodies', gender: 'women', description: 'Ultra-soft oversized fleece hoodies in muted earthy tones' },
      { name: 'Women Jackets', slug: 'women-jackets', gender: 'women', description: 'Tailored oversized blazers and structured trench coats' },
      { name: 'Women Dresses', slug: 'women-dresses', gender: 'women', description: 'Minimalist monochrome slip and architectural maxi dresses' },
      { name: 'Women Trousers', slug: 'women-trousers', gender: 'women', description: 'Wide-leg pleated pants and utilitarian streetwear bottoms' },
      { name: 'Women Jeans', slug: 'women-jeans', gender: 'women', description: 'High-waisted wide leg denim in washed charcoal and vintage blue' },
      { name: 'Women Shirts', slug: 'women-shirts', gender: 'women', description: 'Crisp oversized poplin and structured silk-blend shirts' },

      // Accessories & Highlights
      { name: 'Accessories', slug: 'accessories', gender: 'accessories', description: 'Silver finish jewelry, leather crossbody pouches, and caps' },
    ];

    const insertedCategories: Record<string, number> = {};
    for (const c of categoryData) {
      const [inserted] = await db.insert(categories).values(c).returning();
      insertedCategories[c.slug] = inserted.id;
    }

    // 4. Seed Banners
    await db.insert(banners).values([
      {
        title: 'DEFINE YOUR STYLE. OWN YOUR AURA.',
        subtitle: 'AUTUMN / WINTER 2026 LUXURY STREETWEAR COLLECTION',
        imageUrl: '/src/assets/images/aura_hero_campaign_1793941395011.jpg',
        linkUrl: '/collections/men-hoodies',
        buttonText: 'EXPLORE COLLECTION',
        displayOrder: 1,
        isActive: true,
      },
      {
        title: 'ARCHITECTURAL SILHOUETTES',
        subtitle: 'PRECISION TAILORING MEETS UTILITY ESSENTIALS',
        imageUrl: '/src/assets/images/aura_editorial_story_1793941397255.jpg',
        linkUrl: '/collections/women-jackets',
        buttonText: 'SHOP EDITORIAL',
        displayOrder: 2,
        isActive: true,
      },
    ]);

    // 5. Seed Products with Variants, Prices & Inventory
    const defaultProducts = [
      {
        name: 'AURA Nocturne Heavyweight Hoodie',
        slug: 'aura-nocturne-heavyweight-hoodie',
        sku: 'AF-M-HD-001',
        categoryId: insertedCategories['men-hoodies'] || 1,
        shortDescription: '450 GSM French Terry loopback cotton hoodie with double-layered hood and signature boxy drape.',
        description: 'Engineered for presence and longevity. The Nocturne Heavyweight Hoodie is cut from 450 GSM organic French Terry cotton, enzyme-washed for an ultra-soft hand feel. Features drop shoulders, a seamless kangaroo pocket, and high-density ribbed cuffs with subtle matte silver hardware.',
        fabricDetails: '100% Organic Heavyweight Combed Cotton (450 GSM). Pre-shrunk and double-washed.',
        specifications: {
          Fit: 'Relaxed Oversized Fit',
          Weight: '450 GSM Heavyweight',
          Weave: 'Loopback French Terry',
          Wash: 'Cold hand wash or delicate machine wash inside-out',
        },
        tags: ['hoodie', 'heavyweight', 'oversized', 'streetwear', 'best-seller'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: ['Jet Black', 'Washed Charcoal', 'Raw Bone'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
        image: '/src/assets/images/aura_men_hoodie_1793941395577.jpg',
        prices: {
          mrp: '4999.00',
          sellingPrice: '3499.00',
          salePrice: '3299.00',
          costPrice: '1450.00',
          wholesalePrice: '2200.00',
          minSellingPrice: '2999.00',
          maxSellingPrice: '5499.00',
          discountPercent: '30.00',
          profitAmount: '2049.00',
          profitMargin: '58.56',
        },
        stockPerVariant: 25,
      },
      {
        name: 'AURA Atelier Tailored Streetwear Jacket',
        slug: 'aura-atelier-tailored-streetwear-jacket',
        sku: 'AF-W-JK-002',
        categoryId: insertedCategories['women-jackets'] || 1,
        shortDescription: 'Double-breasted structured jacket with relaxed dropped shoulders and internal satin lining.',
        description: 'Where haute couture meets modern urban mobility. Crafted from a premium wool-blend twill with sharp peak lapels and a contemporary relaxed silhouette. Includes hidden interior magnetic pockets and horn buttons.',
        fabricDetails: '70% Fine Merino Wool, 30% Recycled Polyester Twill. Viscose Bemberg lining.',
        specifications: {
          Fit: 'Structured Relaxed Silhouette',
          Lining: 'Full Viscose Satin',
          Closure: 'Double-breasted horn buttons',
          Origin: 'Handcrafted in Bengaluru Atelier',
        },
        tags: ['jacket', 'outerwear', 'blazer', 'tailored', 'luxury'],
        availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
        availableColors: ['Midnight Onyx', 'Graphite Grey'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        image: '/src/assets/images/aura_women_collection_1793941396390.jpg',
        prices: {
          mrp: '8999.00',
          sellingPrice: '6499.00',
          salePrice: '5999.00',
          costPrice: '2800.00',
          wholesalePrice: '4200.00',
          minSellingPrice: '5499.00',
          maxSellingPrice: '9999.00',
          discountPercent: '27.78',
          profitAmount: '3699.00',
          profitMargin: '56.92',
        },
        stockPerVariant: 15,
      },
      {
        name: 'AURA Brutalist Architectural Cargo Trousers',
        slug: 'aura-brutalist-architectural-cargo-trousers',
        sku: 'AF-M-CG-003',
        categoryId: insertedCategories['men-trousers-cargo'] || 1,
        shortDescription: 'Heavyweight ripstop cargo trousers with 3D pleated bellow pockets and adjustable ankle cinch straps.',
        description: 'Form built for utility. The Brutalist Cargo combines 320 GSM ripstop cotton with articulated knee darts and 6 multi-functional storage compartments. Finished with bungee drawcords at the hem allowing you to transition between wide-leg and tapered fits.',
        fabricDetails: '100% Compact Cotton Ripstop (320 GSM) with water-repellent coating.',
        specifications: {
          Fit: 'Wide Leg with Ankle Cinch',
          Pockets: '6 Utilitarian 3D Cargo Compartments',
          Hardware: 'Matte Gunmetal Eyelets & Bungee Locks',
        },
        tags: ['cargo', 'trousers', 'ripstop', 'utilitarian', 'streetwear'],
        availableSizes: ['30', '32', '34', '36', '38'],
        availableColors: ['Olive Drab', 'Stealth Black'],
        isFeatured: true,
        isNewArrival: false,
        isBestSeller: true,
        image: '/src/assets/images/aura_street_cargo_1793941397890.jpg',
        prices: {
          mrp: '4499.00',
          sellingPrice: '2999.00',
          salePrice: '2799.00',
          costPrice: '1200.00',
          wholesalePrice: '1850.00',
          minSellingPrice: '2499.00',
          maxSellingPrice: '4999.00',
          discountPercent: '33.34',
          profitAmount: '1799.00',
          profitMargin: '59.99',
        },
        stockPerVariant: 20,
      },
      {
        name: 'AURA Raw Edge Oversized Heavyweight Tee',
        slug: 'aura-raw-edge-oversized-heavyweight-tee',
        sku: 'AF-M-TS-004',
        categoryId: insertedCategories['men-oversized-t-shirts'] || 1,
        shortDescription: '280 GSM single jersey heavyweight tee with ribbed thick crewneck collar.',
        description: 'The definitive daily luxury basic. Cut from combed ring-spun 280 GSM cotton with wide armholes and dropped shoulders. Structured to hold its clean silhouette throughout repeated wears.',
        fabricDetails: '100% Combed Compact Cotton (280 GSM). Silicon bio-washed.',
        specifications: {
          Fit: 'Boxy Drop Shoulder',
          Collar: '1.25" High-density ribbed knit',
          Stitching: 'Blind-hem sleeves and bottom',
        },
        tags: ['t-shirt', 'oversized', 'heavyweight', 'essential'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        availableColors: ['Bone White', 'Pitch Black', 'Slate Grey'],
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: true,
        image: '/src/assets/images/aura_editorial_story_1793941397255.jpg',
        prices: {
          mrp: '2499.00',
          sellingPrice: '1699.00',
          salePrice: '1499.00',
          costPrice: '550.00',
          wholesalePrice: '950.00',
          minSellingPrice: '1299.00',
          maxSellingPrice: '2999.00',
          discountPercent: '32.01',
          profitAmount: '1149.00',
          profitMargin: '67.63',
        },
        stockPerVariant: 35,
      },
      {
        name: 'AURA SS26 Editorial Wool Overcoat',
        slug: 'aura-ss26-editorial-wool-overcoat',
        sku: 'AF-U-CT-005',
        categoryId: insertedCategories['men-jackets'] || 1,
        shortDescription: 'Full-length minimalist trench overcoat tailored with architectural storm flap and self-tie belt.',
        description: 'An iconic runway centerpiece. Features extended proportions, deep welt pockets, and a clean concealed button placket for an immaculate luxury profile.',
        fabricDetails: '80% Italian Virgin Wool, 20% Cashmere blend.',
        specifications: {
          Fit: 'Relaxed Full Length',
          Length: 'Calf length (48 inches)',
          Closure: 'Concealed front horn buttons',
        },
        tags: ['overcoat', 'trench', 'luxury', 'wool', 'runway'],
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: ['Charcoal Black', 'Concrete Grey'],
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
        image: '/src/assets/images/aura_hero_campaign_1793941395011.jpg',
        prices: {
          mrp: '14999.00',
          sellingPrice: '11499.00',
          salePrice: '9999.00',
          costPrice: '4800.00',
          wholesalePrice: '7500.00',
          minSellingPrice: '8999.00',
          maxSellingPrice: '16999.00',
          discountPercent: '23.33',
          profitAmount: '6699.00',
          profitMargin: '58.26',
        },
        stockPerVariant: 10,
      },
    ];

    for (const p of defaultProducts) {
      const [insertedProduct] = await db.insert(products).values({
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        categoryId: p.categoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        fabricDetails: p.fabricDetails,
        specifications: p.specifications,
        tags: p.tags,
        availableSizes: p.availableSizes,
        availableColors: p.availableColors,
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isActive: true,
      }).returning();

      // Product Image
      await db.insert(productImages).values({
        productId: insertedProduct.id,
        imageUrl: p.image,
        altText: p.name,
        isPrimary: true,
        sortOrder: 0,
      });

      // Product Price
      await db.insert(productPrices).values({
        productId: insertedProduct.id,
        mrp: p.prices.mrp,
        sellingPrice: p.prices.sellingPrice,
        salePrice: p.prices.salePrice,
        costPrice: p.prices.costPrice,
        wholesalePrice: p.prices.wholesalePrice,
        minSellingPrice: p.prices.minSellingPrice,
        maxSellingPrice: p.prices.maxSellingPrice,
        discountPercent: p.prices.discountPercent,
        profitAmount: p.prices.profitAmount,
        profitMargin: p.prices.profitMargin,
      });

      // Variants and Inventory
      let totalStock = 0;
      for (const size of p.availableSizes) {
        for (const color of p.availableColors) {
          const variantSku = `${p.sku}-${size}-${color.substring(0, 3).toUpperCase()}`;
          const [insertedVariant] = await db.insert(productVariants).values({
            productId: insertedProduct.id,
            sku: variantSku,
            size,
            color,
            stock: p.stockPerVariant,
            isActive: true,
          }).returning();

          await db.insert(inventory).values({
            productId: insertedProduct.id,
            variantId: insertedVariant.id,
            totalStock: p.stockPerVariant,
            availableStock: p.stockPerVariant,
            reservedStock: 0,
            soldQuantity: 0,
            lowStockThreshold: 5,
          });

          totalStock += p.stockPerVariant;
        }
      }

      // Reviews
      await db.insert(reviews).values({
        productId: insertedProduct.id,
        customerName: 'Aarav Varma',
        rating: 5,
        comment: 'Outstanding quality and weight. The fabric drape is superior to international streetwear brands priced triple this.',
        isVerifiedPurchase: true,
        isApproved: true,
      });
      await db.insert(reviews).values({
        productId: insertedProduct.id,
        customerName: 'Zoya Khan',
        rating: 5,
        comment: 'Impeccable cut and packaging. Fast delivery and fits true to relaxed streetwear aesthetic.',
        isVerifiedPurchase: true,
        isApproved: true,
      });
    }

    // 6. Seed Coupons
    await db.insert(coupons).values([
      {
        code: 'AURA10',
        description: '10% off on all orders above ₹999',
        discountType: 'percentage',
        discountValue: '10.00',
        minCartValue: '999.00',
        maxDiscount: '1000.00',
        usageLimit: 500,
        customerLimit: 1,
        isActive: true,
      },
      {
        code: 'FIRSTAURA',
        description: 'Flat ₹500 off on your first order above ₹2499',
        discountType: 'fixed',
        discountValue: '500.00',
        minCartValue: '2499.00',
        maxDiscount: '500.00',
        usageLimit: 1000,
        customerLimit: 1,
        isActive: true,
      },
      {
        code: 'STREETWEAR20',
        description: '20% off on premium oversized apparel above ₹3999',
        discountType: 'percentage',
        discountValue: '20.00',
        minCartValue: '3999.00',
        maxDiscount: '2000.00',
        usageLimit: 200,
        customerLimit: 2,
        isActive: true,
      },
    ]);

    console.log('Database seeded successfully with AURA FIT catalog and configurations!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
