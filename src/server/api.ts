import express, { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.ts';
import {
  admins,
  customers,
  customerAddresses,
  categories,
  products,
  productImages,
  productVariants,
  productPrices,
  priceHistory,
  inventory,
  inventoryHistory,
  carts,
  cartItems,
  wishlists,
  orders,
  orderItems,
  payments,
  refunds,
  coupons,
  couponUsage,
  reviews,
  returns,
  shipping,
  notifications,
  storeSettings,
  banners,
} from '../db/schema.ts';
import { eq, and, desc, asc, sql, ilike, inArray, gte, lte } from 'drizzle-orm';
import { requireAdmin, type AuthRequest } from '../middleware/auth.ts';

const api = Router();

api.use(express.json());

// -------------------------------------------------------------
// 1. STORE SETTINGS & BANNERS
// -------------------------------------------------------------
api.get('/settings', async (_req, res) => {
  try {
    const list = await db.select().from(storeSettings);
    const settingsMap: Record<string, any> = {};
    for (const item of list) {
      settingsMap[item.key] = item.value;
    }
    res.json(settingsMap);
  } catch (err: any) {
    console.error('Failed to get settings:', err);
    res.status(500).json({ error: 'Failed to retrieve store settings' });
  }
});

api.put('/settings', requireAdmin, async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(storeSettings)
        .values({ key, value: value as any, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: storeSettings.key,
          set: { value: value as any, updatedAt: new Date() },
        });
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (err: any) {
    console.error('Failed to update settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

api.get('/banners', async (_req, res) => {
  try {
    const bannerList = await db
      .select()
      .from(banners)
      .where(eq(banners.isActive, true))
      .orderBy(asc(banners.displayOrder));
    res.json(bannerList);
  } catch (err: any) {
    console.error('Failed to get banners:', err);
    res.status(500).json({ error: 'Failed to load banners' });
  }
});

api.get('/admin/banners', requireAdmin, async (_req, res) => {
  try {
    const bannerList = await db.select().from(banners).orderBy(asc(banners.displayOrder));
    res.json(bannerList);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load banners' });
  }
});

api.post('/admin/banners', requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, buttonText, displayOrder, isActive } = req.body;
    const [created] = await db
      .insert(banners)
      .values({
        title,
        subtitle,
        imageUrl,
        linkUrl: linkUrl || '/collections',
        buttonText: buttonText || 'SHOP NOW',
        displayOrder: displayOrder || 0,
        isActive: isActive !== false,
      })
      .returning();
    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

api.put('/admin/banners/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, subtitle, imageUrl, linkUrl, buttonText, displayOrder, isActive } = req.body;
    const [updated] = await db
      .update(banners)
      .set({
        title,
        subtitle,
        imageUrl,
        linkUrl,
        buttonText,
        displayOrder,
        isActive,
      })
      .where(eq(banners.id, id))
      .returning();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

api.delete('/admin/banners/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(banners).where(eq(banners.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// -------------------------------------------------------------
// 2. CATEGORIES
// -------------------------------------------------------------
api.get('/categories', async (_req, res) => {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        gender: categories.gender,
        description: categories.description,
        imageUrl: categories.imageUrl,
        sortOrder: categories.sortOrder,
        isActive: categories.isActive,
        parentId: categories.parentId,
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.name));
    res.json(allCategories);
  } catch (err: any) {
    console.error('Failed to fetch categories:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

api.get('/admin/categories', requireAdmin, async (_req, res) => {
  try {
    const all = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

api.post('/admin/categories', requireAdmin, async (req, res) => {
  try {
    const { name, slug, gender, description, imageUrl, sortOrder, isActive, parentId } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const [created] = await db
      .insert(categories)
      .values({
        name,
        slug: finalSlug,
        gender: gender || 'unisex',
        description,
        imageUrl,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
        parentId: parentId || null,
      })
      .returning();
    res.json(created);
  } catch (err: any) {
    console.error('Create category failed:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

api.put('/admin/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, gender, description, imageUrl, sortOrder, isActive, parentId } = req.body;
    const [updated] = await db
      .update(categories)
      .set({
        name,
        slug,
        gender,
        description,
        imageUrl,
        sortOrder,
        isActive,
        parentId,
      })
      .where(eq(categories.id, id))
      .returning();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

api.delete('/admin/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// -------------------------------------------------------------
// 3. PRODUCTS & CATALOG
// -------------------------------------------------------------
api.get('/products', async (req, res) => {
  try {
    const { category, gender, search, minPrice, maxPrice, sort, isFeatured, isNew, isBestSeller, limit = 50, offset = 0 } = req.query;

    let query = db
      .select({
        product: products,
        category: categories,
        prices: productPrices,
        primaryImage: sql<string>`(
          SELECT image_url FROM product_images
          WHERE product_id = ${products.id}
          ORDER BY is_primary DESC, sort_order ASC LIMIT 1
        )`,
        ratingAvg: sql<number>`COALESCE((
          SELECT AVG(rating)::numeric(2,1) FROM reviews
          WHERE product_id = ${products.id} AND is_approved = true
        ), 5.0)`,
        reviewCount: sql<number>`(
          SELECT COUNT(*)::int FROM reviews
          WHERE product_id = ${products.id} AND is_approved = true
        )`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .where(eq(products.isActive, true));

    const conditions: any[] = [eq(products.isActive, true)];

    if (category) {
      conditions.push(eq(categories.slug, String(category)));
    }
    if (gender) {
      conditions.push(eq(categories.gender, String(gender)));
    }
    if (isFeatured === 'true') {
      conditions.push(eq(products.isFeatured, true));
    }
    if (isNew === 'true') {
      conditions.push(eq(products.isNewArrival, true));
    }
    if (isBestSeller === 'true') {
      conditions.push(eq(products.isBestSeller, true));
    }
    if (search) {
      const term = `%${String(search).trim()}%`;
      conditions.push(
        sql`(${products.name} ILIKE ${term} OR ${products.sku} ILIKE ${term} OR ${products.description} ILIKE ${term})`
      );
    }
    if (minPrice) {
      conditions.push(gte(productPrices.sellingPrice, String(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(productPrices.sellingPrice, String(maxPrice)));
    }

    let finalQuery = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        fabricDetails: products.fabricDetails,
        specifications: products.specifications,
        tags: products.tags,
        availableSizes: products.availableSizes,
        availableColors: products.availableColors,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        isBestSeller: products.isBestSeller,
        mrp: productPrices.mrp,
        sellingPrice: productPrices.sellingPrice,
        salePrice: productPrices.salePrice,
        discountPercent: productPrices.discountPercent,
        primaryImage: sql<string>`COALESCE((
          SELECT image_url FROM product_images
          WHERE product_id = ${products.id}
          ORDER BY is_primary DESC, sort_order ASC LIMIT 1
        ), '/src/assets/images/aura_hero_campaign_1793941395011.jpg')`,
        ratingAvg: sql<string>`COALESCE((
          SELECT ROUND(AVG(rating)::numeric, 1)::text FROM reviews
          WHERE product_id = ${products.id} AND is_approved = true
        ), '5.0')`,
        reviewCount: sql<number>`(
          SELECT COUNT(*)::int FROM reviews
          WHERE product_id = ${products.id} AND is_approved = true
        )`,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .where(and(...conditions));

    if (sort === 'price_asc') {
      finalQuery = finalQuery.orderBy(asc(productPrices.sellingPrice)) as any;
    } else if (sort === 'price_desc') {
      finalQuery = finalQuery.orderBy(desc(productPrices.sellingPrice)) as any;
    } else if (sort === 'discount') {
      finalQuery = finalQuery.orderBy(desc(productPrices.discountPercent)) as any;
    } else if (sort === 'newest') {
      finalQuery = finalQuery.orderBy(desc(products.createdAt)) as any;
    } else {
      finalQuery = finalQuery.orderBy(desc(products.isFeatured), desc(products.createdAt)) as any;
    }

    const items = await finalQuery.limit(Number(limit)).offset(Number(offset));
    res.json(items);
  } catch (err: any) {
    console.error('Failed to query products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

api.get('/products/:slugOrId', async (req, res) => {
  try {
    const param = req.params.slugOrId;
    const isNum = !isNaN(Number(param));

    const condition = isNum ? eq(products.id, Number(param)) : eq(products.slug, param);

    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        shortDescription: products.shortDescription,
        description: products.description,
        fabricDetails: products.fabricDetails,
        specifications: products.specifications,
        tags: products.tags,
        availableSizes: products.availableSizes,
        availableColors: products.availableColors,
        isFeatured: products.isFeatured,
        isNewArrival: products.isNewArrival,
        isBestSeller: products.isBestSeller,
        isActive: products.isActive,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(condition)
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch images
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder));

    // Fetch prices
    const [prices] = await db
      .select()
      .from(productPrices)
      .where(eq(productPrices.productId, product.id))
      .limit(1);

    // Fetch variants & stock
    const variants = await db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        size: productVariants.size,
        color: productVariants.color,
        stock: productVariants.stock,
        priceOverride: productVariants.priceOverride,
        isActive: productVariants.isActive,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    // Fetch reviews
    const productReviews = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));

    // Fetch related products in same category
    const related = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sellingPrice: productPrices.sellingPrice,
        mrp: productPrices.mrp,
        discountPercent: productPrices.discountPercent,
        primaryImage: sql<string>`(
          SELECT image_url FROM product_images
          WHERE product_id = ${products.id}
          ORDER BY is_primary DESC, sort_order ASC LIMIT 1
        )`,
      })
      .from(products)
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .where(and(eq(products.categoryId, product.categoryId), sql`${products.id} != ${product.id}`))
      .limit(4);

    res.json({
      ...product,
      images,
      prices,
      variants,
      reviews: productReviews,
      related,
    });
  } catch (err: any) {
    console.error('Failed to get product details:', err);
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// -------------------------------------------------------------
// 4. ADMIN PRODUCT MANAGEMENT (CRUD)
// -------------------------------------------------------------
api.post('/admin/products', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      sku,
      categoryId,
      shortDescription,
      description,
      fabricDetails,
      specifications,
      tags,
      availableSizes,
      availableColors,
      isFeatured,
      isNewArrival,
      isBestSeller,
      images,
      mrp,
      sellingPrice,
      costPrice = '0',
      wholesalePrice,
      minSellingPrice,
      maxSellingPrice,
      stock = 20,
    } = req.body;

    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mrpNum = parseFloat(mrp) || 0;
    const sellNum = parseFloat(sellingPrice) || mrpNum;
    const costNum = parseFloat(costPrice) || 0;

    const discountAmount = Math.max(0, mrpNum - sellNum);
    const discountPercent = mrpNum > 0 ? ((discountAmount / mrpNum) * 100).toFixed(2) : '0';
    const profitAmount = (sellNum - costNum).toFixed(2);
    const profitMargin = sellNum > 0 ? (((sellNum - costNum) / sellNum) * 100).toFixed(2) : '0';

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug: finalSlug,
        sku,
        categoryId: Number(categoryId),
        shortDescription,
        description,
        fabricDetails,
        specifications: specifications || {},
        tags: tags || [],
        availableSizes: availableSizes || ['S', 'M', 'L', 'XL'],
        availableColors: availableColors || ['Black'],
        isFeatured: Boolean(isFeatured),
        isNewArrival: isNewArrival !== false,
        isBestSeller: Boolean(isBestSeller),
        isActive: true,
      })
      .returning();

    // Insert prices
    await db.insert(productPrices).values({
      productId: newProduct.id,
      mrp: mrpNum.toFixed(2),
      sellingPrice: sellNum.toFixed(2),
      costPrice: costNum.toFixed(2),
      wholesalePrice: wholesalePrice ? String(wholesalePrice) : null,
      minSellingPrice: minSellingPrice ? String(minSellingPrice) : null,
      maxSellingPrice: maxSellingPrice ? String(maxSellingPrice) : null,
      discountPercent,
      profitAmount,
      profitMargin,
    });

    // Insert images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.insert(productImages).values({
          productId: newProduct.id,
          imageUrl: images[i],
          altText: name,
          isPrimary: i === 0,
          sortOrder: i,
        });
      }
    } else {
      await db.insert(productImages).values({
        productId: newProduct.id,
        imageUrl: '/src/assets/images/aura_hero_campaign_1793941395011.jpg',
        altText: name,
        isPrimary: true,
        sortOrder: 0,
      });
    }

    // Insert Variants & Inventory
    const sizes = availableSizes || ['S', 'M', 'L', 'XL'];
    const colors = availableColors || ['Black'];
    for (const s of sizes) {
      for (const c of colors) {
        const variantSku = `${sku}-${s}-${c.substring(0, 3).toUpperCase()}`;
        const [variant] = await db
          .insert(productVariants)
          .values({
            productId: newProduct.id,
            sku: variantSku,
            size: s,
            color: c,
            stock: Number(stock),
            isActive: true,
          })
          .returning();

        await db.insert(inventory).values({
          productId: newProduct.id,
          variantId: variant.id,
          totalStock: Number(stock),
          availableStock: Number(stock),
          reservedStock: 0,
          soldQuantity: 0,
          lowStockThreshold: 5,
        });
      }
    }

    res.json(newProduct);
  } catch (err: any) {
    console.error('Failed to create product:', err);
    res.status(500).json({ error: 'Failed to create product: ' + err.message });
  }
});

api.put('/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      name,
      slug,
      sku,
      categoryId,
      shortDescription,
      description,
      fabricDetails,
      specifications,
      tags,
      availableSizes,
      availableColors,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isActive,
    } = req.body;

    const [updated] = await db
      .update(products)
      .set({
        name,
        slug,
        sku,
        categoryId: Number(categoryId),
        shortDescription,
        description,
        fabricDetails,
        specifications,
        tags,
        availableSizes,
        availableColors,
        isFeatured,
        isNewArrival,
        isBestSeller,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

api.delete('/admin/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    // Soft toggle or hard delete
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// -------------------------------------------------------------
// 5. ADVANCED PRICE MANAGEMENT SYSTEM
// -------------------------------------------------------------
api.get('/admin/prices', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        categoryName: categories.name,
        mrp: productPrices.mrp,
        sellingPrice: productPrices.sellingPrice,
        salePrice: productPrices.salePrice,
        costPrice: productPrices.costPrice,
        wholesalePrice: productPrices.wholesalePrice,
        minSellingPrice: productPrices.minSellingPrice,
        maxSellingPrice: productPrices.maxSellingPrice,
        discountPercent: productPrices.discountPercent,
        profitAmount: productPrices.profitAmount,
        profitMargin: productPrices.profitMargin,
        saleStartAt: productPrices.saleStartAt,
        saleEndAt: productPrices.saleEndAt,
        updatedAt: productPrices.updatedAt,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productPrices, eq(products.id, productPrices.productId))
      .orderBy(asc(products.name));

    res.json(list);
  } catch (err: any) {
    console.error('Failed to get price list:', err);
    res.status(500).json({ error: 'Failed to load prices' });
  }
});

api.put('/admin/prices/:productId', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const {
      mrp,
      sellingPrice,
      salePrice,
      costPrice,
      wholesalePrice,
      minSellingPrice,
      maxSellingPrice,
      saleStartAt,
      saleEndAt,
      reason,
    } = req.body;

    // Fetch existing price for log
    const [existing] = await db
      .select()
      .from(productPrices)
      .where(eq(productPrices.productId, productId))
      .limit(1);

    const mrpNum = parseFloat(mrp) || parseFloat(existing?.mrp || '0');
    const sellNum = parseFloat(sellingPrice) || parseFloat(existing?.sellingPrice || '0');
    const costNum = parseFloat(costPrice !== undefined ? costPrice : existing?.costPrice || '0');

    // Automatic price calculations
    const discountAmount = Math.max(0, mrpNum - sellNum);
    const discountPercent = mrpNum > 0 ? ((discountAmount / mrpNum) * 100).toFixed(2) : '0';
    const profitAmount = (sellNum - costNum).toFixed(2);
    const profitMargin = sellNum > 0 ? (((sellNum - costNum) / sellNum) * 100).toFixed(2) : '0';

    const [updated] = await db
      .insert(productPrices)
      .values({
        productId,
        mrp: mrpNum.toFixed(2),
        sellingPrice: sellNum.toFixed(2),
        salePrice: salePrice ? String(salePrice) : null,
        costPrice: costNum.toFixed(2),
        wholesalePrice: wholesalePrice ? String(wholesalePrice) : null,
        minSellingPrice: minSellingPrice ? String(minSellingPrice) : null,
        maxSellingPrice: maxSellingPrice ? String(maxSellingPrice) : null,
        discountPercent,
        profitAmount,
        profitMargin,
        saleStartAt: saleStartAt ? new Date(saleStartAt) : null,
        saleEndAt: saleEndAt ? new Date(saleEndAt) : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: productPrices.productId,
        set: {
          mrp: mrpNum.toFixed(2),
          sellingPrice: sellNum.toFixed(2),
          salePrice: salePrice ? String(salePrice) : null,
          costPrice: costNum.toFixed(2),
          wholesalePrice: wholesalePrice ? String(wholesalePrice) : null,
          minSellingPrice: minSellingPrice ? String(minSellingPrice) : null,
          maxSellingPrice: maxSellingPrice ? String(maxSellingPrice) : null,
          discountPercent,
          profitAmount,
          profitMargin,
          saleStartAt: saleStartAt ? new Date(saleStartAt) : null,
          saleEndAt: saleEndAt ? new Date(saleEndAt) : null,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Record price change log
    await db.insert(priceHistory).values({
      productId,
      oldMrp: existing?.mrp || null,
      newMrp: mrpNum.toFixed(2),
      oldSellingPrice: existing?.sellingPrice || null,
      newSellingPrice: sellNum.toFixed(2),
      changedBy: req.admin?.name || 'Admin',
      reason: reason || 'Manual Price Adjustment',
    });

    res.json(updated);
  } catch (err: any) {
    console.error('Failed to update price:', err);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

api.get('/admin/prices/:productId/history', requireAdmin, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const logs = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.productId, productId))
      .orderBy(desc(priceHistory.createdAt));
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load price history' });
  }
});

api.post('/admin/prices/bulk', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { actionType, value, categoryId } = req.body;
    // actionType: 'discount_percentage' | 'markup_percentage' | 'fixed_discount'
    const pct = parseFloat(value) || 0;

    let targetProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(categoryId ? eq(products.categoryId, Number(categoryId)) : eq(products.isActive, true));

    let updatedCount = 0;
    for (const p of targetProducts) {
      const [curr] = await db.select().from(productPrices).where(eq(productPrices.productId, p.id));
      if (!curr) continue;

      const mrpNum = parseFloat(curr.mrp);
      let newSell = parseFloat(curr.sellingPrice);
      const costNum = parseFloat(curr.costPrice);

      if (actionType === 'discount_percentage') {
        newSell = mrpNum * (1 - pct / 100);
      } else if (actionType === 'markup_percentage') {
        newSell = newSell * (1 + pct / 100);
      } else if (actionType === 'fixed_discount') {
        newSell = Math.max(costNum, newSell - pct);
      }

      newSell = Math.max(1, Math.round(newSell));
      const discountPercent = mrpNum > 0 ? (((mrpNum - newSell) / mrpNum) * 100).toFixed(2) : '0';
      const profitAmount = (newSell - costNum).toFixed(2);
      const profitMargin = newSell > 0 ? (((newSell - costNum) / newSell) * 100).toFixed(2) : '0';

      await db
        .update(productPrices)
        .set({
          sellingPrice: newSell.toFixed(2),
          discountPercent,
          profitAmount,
          profitMargin,
          updatedAt: new Date(),
        })
        .where(eq(productPrices.productId, p.id));

      await db.insert(priceHistory).values({
        productId: p.id,
        oldSellingPrice: curr.sellingPrice,
        newSellingPrice: newSell.toFixed(2),
        oldMrp: curr.mrp,
        newMrp: curr.mrp,
        changedBy: req.admin?.name || 'Admin',
        reason: `Bulk Update (${actionType}: ${value})`,
      });

      updatedCount++;
    }

    res.json({ success: true, updatedCount });
  } catch (err: any) {
    console.error('Bulk price update failed:', err);
    res.status(500).json({ error: 'Bulk update failed' });
  }
});

// -------------------------------------------------------------
// 6. INVENTORY MANAGEMENT
// -------------------------------------------------------------
api.get('/admin/inventory', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select({
        inventoryId: inventory.id,
        productId: products.id,
        productName: products.name,
        sku: productVariants.sku,
        variantId: productVariants.id,
        size: productVariants.size,
        color: productVariants.color,
        totalStock: inventory.totalStock,
        availableStock: inventory.availableStock,
        reservedStock: inventory.reservedStock,
        soldQuantity: inventory.soldQuantity,
        lowStockThreshold: inventory.lowStockThreshold,
        sellingPrice: productPrices.sellingPrice,
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
      .leftJoin(productPrices, eq(products.id, productPrices.productId))
      .orderBy(asc(products.name), asc(productVariants.size));

    res.json(list);
  } catch (err: any) {
    console.error('Failed to get inventory:', err);
    res.status(500).json({ error: 'Failed to load inventory' });
  }
});

api.post('/admin/inventory/adjust', requireAdmin, async (req, res) => {
  try {
    const { variantId, quantityChange, changeType, reason } = req.body;
    const vId = Number(variantId);
    const qty = parseInt(quantityChange, 10);

    const [currentInv] = await db.select().from(inventory).where(eq(inventory.variantId, vId)).limit(1);
    if (!currentInv) {
      return res.status(404).json({ error: 'Inventory record not found' });
    }

    const prevStock = currentInv.availableStock;
    const newStock = Math.max(0, prevStock + qty);

    await db
      .update(inventory)
      .set({
        availableStock: newStock,
        totalStock: Math.max(0, currentInv.totalStock + qty),
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, currentInv.id));

    await db.update(productVariants).set({ stock: newStock }).where(eq(productVariants.id, vId));

    await db.insert(inventoryHistory).values({
      productId: currentInv.productId,
      variantId: vId,
      changeType: changeType || 'manual_adjustment',
      quantity: qty,
      previousStock: prevStock,
      newStock,
      reason: reason || 'Admin manual stock balance',
    });

    res.json({ success: true, newStock, previousStock: prevStock });
  } catch (err: any) {
    console.error('Failed to adjust inventory:', err);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
});

api.get('/admin/inventory/history', requireAdmin, async (_req, res) => {
  try {
    const logs = await db
      .select({
        id: inventoryHistory.id,
        productName: products.name,
        variantSku: productVariants.sku,
        size: productVariants.size,
        color: productVariants.color,
        changeType: inventoryHistory.changeType,
        quantity: inventoryHistory.quantity,
        previousStock: inventoryHistory.previousStock,
        newStock: inventoryHistory.newStock,
        reason: inventoryHistory.reason,
        createdAt: inventoryHistory.createdAt,
      })
      .from(inventoryHistory)
      .innerJoin(products, eq(inventoryHistory.productId, products.id))
      .leftJoin(productVariants, eq(inventoryHistory.variantId, productVariants.id))
      .orderBy(desc(inventoryHistory.createdAt))
      .limit(100);

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load inventory logs' });
  }
});

// -------------------------------------------------------------
// 7. COUPONS MANAGEMENT & VALIDATION
// -------------------------------------------------------------
api.get('/admin/coupons', requireAdmin, async (_req, res) => {
  try {
    const list = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load coupons' });
  }
});

api.post('/admin/coupons', requireAdmin, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minCartValue,
      maxDiscount,
      usageLimit,
      customerLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const [created] = await db
      .insert(coupons)
      .values({
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue: String(discountValue),
        minCartValue: String(minCartValue || 0),
        maxDiscount: maxDiscount ? String(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        customerLimit: customerLimit ? Number(customerLimit) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== false,
      })
      .returning();

    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create coupon: ' + err.message });
  }
});

api.put('/admin/coupons/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      code,
      description,
      discountType,
      discountValue,
      minCartValue,
      maxDiscount,
      usageLimit,
      customerLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const [updated] = await db
      .update(coupons)
      .set({
        code: code ? code.toUpperCase().trim() : undefined,
        description,
        discountType,
        discountValue: discountValue ? String(discountValue) : undefined,
        minCartValue: minCartValue ? String(minCartValue) : undefined,
        maxDiscount: maxDiscount ? String(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        customerLimit: customerLimit ? Number(customerLimit) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
      })
      .where(eq(coupons.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

api.delete('/admin/coupons/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(coupons).where(eq(coupons.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

api.post('/coupons/validate', async (req, res) => {
  try {
    const { code, cartSubtotal, customerId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code required' });
    }

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.toUpperCase().trim()), eq(coupons.isActive, true)))
      .limit(1);

    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }

    // Expiration check
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ error: 'Coupon is not yet active' });
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Minimum cart value check
    const subtotal = parseFloat(cartSubtotal) || 0;
    const minVal = parseFloat(coupon.minCartValue || '0');
    if (subtotal < minVal) {
      return res.status(400).json({
        error: `Minimum order value for coupon ${coupon.code} is ₹${minVal}`,
      });
    }

    // Usage limits
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached' });
    }

    // Customer usage check
    if (customerId) {
      const uses = await db
        .select({ count: sql<number>`count(*)` })
        .from(couponUsage)
        .where(and(eq(couponUsage.couponId, coupon.id), eq(couponUsage.customerId, Number(customerId))));
      if (Number(uses[0]?.count || 0) >= coupon.customerLimit) {
        return res.status(400).json({ error: 'You have already reached the usage limit for this coupon' });
      }
    }

    // Calculate discount
    let discount = 0;
    const val = parseFloat(coupon.discountValue);
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * val) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscount));
      }
    } else {
      discount = val;
    }
    discount = Math.min(discount, subtotal);

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount.toFixed(2),
      description: coupon.description,
    });
  } catch (err: any) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// -------------------------------------------------------------
// 8. CHECKOUT & ORDERS (SECURE SERVER-SIDE VALIDATION)
// -------------------------------------------------------------
api.post('/checkout/calculate', async (req, res) => {
  try {
    const { items, couponCode } = req.body;
    // items: [{ productId, variantId, quantity, size, color }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let verifiedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          sellingPrice: productPrices.sellingPrice,
          mrp: productPrices.mrp,
          primaryImage: sql<string>`(
            SELECT image_url FROM product_images
            WHERE product_id = ${products.id}
            ORDER BY is_primary DESC, sort_order ASC LIMIT 1
          )`,
        })
        .from(products)
        .leftJoin(productPrices, eq(products.id, productPrices.productId))
        .where(eq(products.id, Number(item.productId)))
        .limit(1);

      if (!product) continue;

      // Check variant stock
      let availableStock = 99;
      if (item.variantId) {
        const [inv] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.variantId, Number(item.variantId)))
          .limit(1);
        if (inv) availableStock = inv.availableStock;
      }

      const unitPrice = parseFloat(product.sellingPrice || '0');
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = unitPrice * qty;
      verifiedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        sku: product.sku,
        size: item.size || 'M',
        color: item.color || 'Black',
        unitPrice: unitPrice.toFixed(2),
        quantity: qty,
        lineTotal: lineTotal.toFixed(2),
        imageUrl: product.primaryImage,
        inStock: availableStock >= qty,
        availableStock,
      });
    }

    // Settings for shipping
    const [freeShipSetting] = await db.select().from(storeSettings).where(eq(storeSettings.key, 'free_shipping_threshold'));
    const freeShipThreshold = freeShipSetting ? parseFloat(freeShipSetting.value as any) : 1999;
    const shippingFee = verifiedSubtotal >= freeShipThreshold || verifiedSubtotal === 0 ? 0 : 149;

    // Coupon calculation
    let discountAmount = 0;
    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, couponCode.toUpperCase().trim()), eq(coupons.isActive, true)))
        .limit(1);

      if (coupon && verifiedSubtotal >= parseFloat(coupon.minCartValue || '0')) {
        const val = parseFloat(coupon.discountValue);
        if (coupon.discountType === 'percentage') {
          discountAmount = (verifiedSubtotal * val) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
          }
        } else {
          discountAmount = val;
        }
        discountAmount = Math.min(discountAmount, verifiedSubtotal);
      }
    }

    const totalAmount = Math.max(0, verifiedSubtotal - discountAmount + shippingFee);

    res.json({
      items: validatedItems,
      subtotal: verifiedSubtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      freeShippingQualified: verifiedSubtotal >= freeShipThreshold,
      freeShippingThreshold: freeShipThreshold,
    });
  } catch (err: any) {
    console.error('Checkout calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate checkout summary' });
  }
});

api.post('/checkout/order', async (req, res) => {
  try {
    const {
      customerInfo,
      shippingAddress,
      deliveryMethod = 'Standard Express',
      paymentMethod, // 'COD' | 'UPI' | 'RAZORPAY'
      items,
      couponCode,
      notes,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No items in order' });
    }
    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.streetAddress) {
      return res.status(400).json({ error: 'Shipping address is incomplete' });
    }

    // 1. Calculate and re-verify everything on backend
    let subtotal = 0;
    const orderItemsToInsert: any[] = [];
    const stockDeductions: { variantId: number; qty: number; productId: number }[] = [];

    for (const item of items) {
      const [product] = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          sellingPrice: productPrices.sellingPrice,
          primaryImage: sql<string>`(
            SELECT image_url FROM product_images
            WHERE product_id = ${products.id}
            ORDER BY is_primary DESC, sort_order ASC LIMIT 1
          )`,
        })
        .from(products)
        .leftJoin(productPrices, eq(products.id, productPrices.productId))
        .where(eq(products.id, Number(item.productId)))
        .limit(1);

      if (!product) {
        return res.status(400).json({ error: `Product ID ${item.productId} is invalid` });
      }

      // Check stock
      if (item.variantId) {
        const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, Number(item.variantId)));
        if (!inv || inv.availableStock < Number(item.quantity)) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name} (Size: ${item.size}). Available: ${inv?.availableStock || 0}`,
          });
        }
        stockDeductions.push({
          variantId: Number(item.variantId),
          qty: Number(item.quantity),
          productId: product.id,
        });
      }

      const unitPrice = parseFloat(product.sellingPrice || '0');
      const qty = Math.max(1, Number(item.quantity));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItemsToInsert.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        sku: product.sku,
        size: item.size || 'M',
        color: item.color || 'Black',
        imageUrl: product.primaryImage || item.imageUrl,
        unitPrice: unitPrice.toFixed(2),
        quantity: qty,
        totalPrice: lineTotal.toFixed(2),
      });
    }

    // Shipping fee
    const shippingFee = subtotal >= 1999 ? 0 : 149;

    // Coupon discount
    let discountAmount = 0;
    let validCouponId: number | null = null;
    if (couponCode) {
      const [c] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, couponCode.toUpperCase().trim()), eq(coupons.isActive, true)))
        .limit(1);
      if (c && subtotal >= parseFloat(c.minCartValue || '0')) {
        validCouponId = c.id;
        const val = parseFloat(c.discountValue);
        if (c.discountType === 'percentage') {
          discountAmount = (subtotal * val) / 100;
          if (c.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(c.maxDiscount));
        } else {
          discountAmount = val;
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const totalAmount = (subtotal - discountAmount + shippingFee).toFixed(2);

    // Generate Order Number: AF-2026-XXXXX
    const orderNumber = `AF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const trackingNumber = `BLUEDART-${Math.floor(100000000 + Math.random() * 900000000)}`;

    // Create Order Record
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId: customerInfo?.id || null,
        customerEmail: customerInfo?.email || shippingAddress.email || 'customer@aurafit.store',
        customerName: customerInfo?.name || shippingAddress.recipientName,
        customerPhone: shippingAddress.phone,
        shippingAddress,
        deliveryMethod,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: paymentMethod === 'COD' ? 'CONFIRMED' : 'PROCESSING',
        trackingNumber,
        courierName: 'BlueDart Express',
        subtotal: subtotal.toFixed(2),
        discountAmount: discountAmount.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        totalAmount,
        couponCode: couponCode || null,
        notes,
      })
      .returning();

    // Insert Order Items
    for (const oi of orderItemsToInsert) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        ...oi,
      });
    }

    // Deduct inventory
    for (const d of stockDeductions) {
      const [curr] = await db.select().from(inventory).where(eq(inventory.variantId, d.variantId));
      if (curr) {
        const newAvail = Math.max(0, curr.availableStock - d.qty);
        const newSold = curr.soldQuantity + d.qty;
        await db
          .update(inventory)
          .set({
            availableStock: newAvail,
            soldQuantity: newSold,
            updatedAt: new Date(),
          })
          .where(eq(inventory.id, curr.id));

        await db.update(productVariants).set({ stock: newAvail }).where(eq(productVariants.id, d.variantId));

        await db.insert(inventoryHistory).values({
          productId: d.productId,
          variantId: d.variantId,
          changeType: 'order_placed',
          quantity: -d.qty,
          previousStock: curr.availableStock,
          newStock: newAvail,
          reason: `Order ${orderNumber}`,
        });
      }
    }

    // Insert Payment Record
    const transactionId = `TXN-${orderNumber}-${Date.now().toString().slice(-4)}`;
    await db.insert(payments).values({
      orderId: newOrder.id,
      transactionId,
      paymentMethod,
      gateway: paymentMethod === 'RAZORPAY' ? 'Razorpay' : paymentMethod === 'UPI' ? 'UPI' : 'CashOnDelivery',
      amount: totalAmount,
      currency: 'INR',
      status: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
    });

    // Insert Shipping Record
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 4);
    await db.insert(shipping).values({
      orderId: newOrder.id,
      courierName: 'BlueDart Express',
      trackingNumber,
      estimatedDelivery: estDelivery.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'LABEL_CREATED',
      dispatchDate: new Date(),
    });

    // Record coupon usage
    if (validCouponId) {
      await db.insert(couponUsage).values({
        couponId: validCouponId,
        customerId: customerInfo?.id || null,
        orderId: newOrder.id,
        discountApplied: discountAmount.toFixed(2),
      });

      await db
        .update(coupons)
        .set({ timesUsed: sql`${coupons.timesUsed} + 1` })
        .where(eq(coupons.id, validCouponId));
    }

    // Insert notification
    await db.insert(notifications).values({
      recipientType: 'admin',
      title: `New Order Placed: #${orderNumber}`,
      message: `${newOrder.customerName} placed an order for ₹${totalAmount} via ${paymentMethod}`,
      type: 'order',
    });

    res.json({
      success: true,
      order: newOrder,
      trackingNumber,
      transactionId,
      items: orderItemsToInsert,
    });
  } catch (err: any) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Order creation failed: ' + err.message });
  }
});

// -------------------------------------------------------------
// 9. ORDERS & TRACKING
// -------------------------------------------------------------
api.get('/orders', async (req, res) => {
  try {
    const { email, customerId, search, status, paymentStatus, limit = 50 } = req.query;
    const conditions: any[] = [];

    if (email) conditions.push(eq(orders.customerEmail, String(email)));
    if (customerId) conditions.push(eq(orders.customerId, Number(customerId)));
    if (status) conditions.push(eq(orders.orderStatus, String(status)));
    if (paymentStatus) conditions.push(eq(orders.paymentStatus, String(paymentStatus)));
    if (search) {
      const term = `%${String(search).trim()}%`;
      conditions.push(
        sql`(${orders.orderNumber} ILIKE ${term} OR ${orders.customerName} ILIKE ${term} OR ${orders.customerEmail} ILIKE ${term})`
      );
    }

    let q = db.select().from(orders);
    if (conditions.length > 0) {
      q = q.where(and(...conditions)) as any;
    }
    const list = await q.orderBy(desc(orders.createdAt)).limit(Number(limit));
    res.json(list);
  } catch (err: any) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

api.get('/orders/:orderNumberOrId', async (req, res) => {
  try {
    const param = req.params.orderNumberOrId;
    const isNum = !isNaN(Number(param));

    const condition = isNum ? eq(orders.id, Number(param)) : eq(orders.orderNumber, param);
    const [order] = await db.select().from(orders).where(condition).limit(1);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const [ship] = await db.select().from(shipping).where(eq(shipping.orderId, order.id)).limit(1);
    const [pmt] = await db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1);

    res.json({
      ...order,
      items,
      shipping: ship,
      payment: pmt,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load order details' });
  }
});

api.put('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { orderStatus, paymentStatus, trackingNumber, courierName } = req.body;

    const [existing] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [updated] = await db
      .update(orders)
      .set({
        orderStatus: orderStatus || existing.orderStatus,
        paymentStatus: paymentStatus || existing.paymentStatus,
        trackingNumber: trackingNumber || existing.trackingNumber,
        courierName: courierName || existing.courierName,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    // If order was cancelled or returned, automatically restore inventory!
    if (orderStatus === 'CANCELLED' && existing.orderStatus !== 'CANCELLED') {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of items) {
        if (item.variantId) {
          const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, item.variantId));
          if (inv) {
            const restoredStock = inv.availableStock + item.quantity;
            await db
              .update(inventory)
              .set({
                availableStock: restoredStock,
                soldQuantity: Math.max(0, inv.soldQuantity - item.quantity),
                updatedAt: new Date(),
              })
              .where(eq(inventory.id, inv.id));

            await db.update(productVariants).set({ stock: restoredStock }).where(eq(productVariants.id, item.variantId));

            await db.insert(inventoryHistory).values({
              productId: item.productId,
              variantId: item.variantId,
              changeType: 'order_cancelled',
              quantity: item.quantity,
              previousStock: inv.availableStock,
              newStock: restoredStock,
              reason: `Restored stock from cancelled order #${existing.orderNumber}`,
            });
          }
        }
      }
    }

    res.json(updated);
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// -------------------------------------------------------------
// 10. RETURNS & REFUNDS
// -------------------------------------------------------------
api.post('/returns', async (req, res) => {
  try {
    const { orderId, customerId, reason, notes } = req.body;
    const [created] = await db
      .insert(returns)
      .values({
        orderId: Number(orderId),
        customerId: customerId ? Number(customerId) : null,
        reason,
        notes,
        status: 'PENDING',
      })
      .returning();

    await db.insert(notifications).values({
      recipientType: 'admin',
      title: `Return Requested for Order #${orderId}`,
      message: `Customer requested return: "${reason}"`,
      type: 'alert',
    });

    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit return request' });
  }
});

api.get('/admin/returns', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select({
        returnRecord: returns,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        totalAmount: orders.totalAmount,
      })
      .from(returns)
      .innerJoin(orders, eq(returns.orderId, orders.id))
      .orderBy(desc(returns.createdAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load returns' });
  }
});

api.put('/admin/returns/:id', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, adminResponse, restoreStock } = req.body;

    const [curr] = await db.select().from(returns).where(eq(returns.id, id)).limit(1);
    if (!curr) return res.status(404).json({ error: 'Return request not found' });

    const [updated] = await db
      .update(returns)
      .set({
        status,
        adminResponse,
        stockRestored: restoreStock || curr.stockRestored,
        updatedAt: new Date(),
      })
      .where(eq(returns.id, id))
      .returning();

    // If approved and stock restoration requested
    if (restoreStock && !curr.stockRestored) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, curr.orderId));
      for (const item of items) {
        if (item.variantId) {
          const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, item.variantId));
          if (inv) {
            const restored = inv.availableStock + item.quantity;
            await db.update(inventory).set({ availableStock: restored }).where(eq(inventory.id, inv.id));
            await db.update(productVariants).set({ stock: restored }).where(eq(productVariants.id, item.variantId));
          }
        }
      }
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update return request' });
  }
});

// -------------------------------------------------------------
// 11. CUSTOMER ACCOUNTS & AUTH
// -------------------------------------------------------------
api.post('/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(and(eq(admins.email, email.toLowerCase().trim()), eq(admins.isActive, true)))
      .limit(1);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = `auraadmin_${admin.id}_${Date.now()}`;
    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

api.post('/auth/customer/sync', async (req, res) => {
  try {
    const { firebaseUid, email, name, phone, avatarUrl } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const [customer] = await db
      .insert(customers)
      .values({
        firebaseUid,
        email: email.toLowerCase().trim(),
        name: name || email.split('@')[0],
        phone,
        avatarUrl,
        isBlocked: false,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          firebaseUid: firebaseUid || undefined,
          name: name || undefined,
          phone: phone || undefined,
          avatarUrl: avatarUrl || undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (customer.isBlocked) {
      return res.status(403).json({ error: 'Your customer account has been suspended by store administration.' });
    }

    res.json(customer);
  } catch (err: any) {
    console.error('Customer sync failed:', err);
    res.status(500).json({ error: 'Failed to sync customer profile' });
  }
});

api.get('/admin/customers', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select({
        id: customers.id,
        email: customers.email,
        name: customers.name,
        phone: customers.phone,
        isBlocked: customers.isBlocked,
        createdAt: customers.createdAt,
        orderCount: sql<number>`(SELECT COUNT(*)::int FROM orders WHERE customer_id = ${customers.id})`,
        totalSpend: sql<string>`COALESCE((SELECT SUM(total_amount)::text FROM orders WHERE customer_id = ${customers.id} AND payment_status = 'PAID'), '0.00')`,
      })
      .from(customers)
      .orderBy(desc(customers.createdAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load customers' });
  }
});

api.put('/admin/customers/:id/toggle-block', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [c] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!c) return res.status(404).json({ error: 'Customer not found' });

    const [updated] = await db
      .update(customers)
      .set({ isBlocked: !c.isBlocked, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle customer status' });
  }
});

// -------------------------------------------------------------
// 12. ANALYTICS & DASHBOARD METRICS
// -------------------------------------------------------------
api.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    const [totRevenue] = await db
      .select({ sum: sql<string>`COALESCE(SUM(total_amount), 0)::text` })
      .from(orders)
      .where(eq(orders.paymentStatus, 'PAID'));

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const [todayRev] = await db
      .select({ sum: sql<string>`COALESCE(SUM(total_amount), 0)::text` })
      .from(orders)
      .where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, todayDate)));

    const firstOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const [monthRev] = await db
      .select({ sum: sql<string>`COALESCE(SUM(total_amount), 0)::text` })
      .from(orders)
      .where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, firstOfMonth)));

    const [orderStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        pending: sql<number>`COUNT(CASE WHEN order_status IN ('PENDING', 'PROCESSING') THEN 1 END)::int`,
        completed: sql<number>`COUNT(CASE WHEN order_status = 'DELIVERED' THEN 1 END)::int`,
      })
      .from(orders);

    const [customerCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(customers);
    const [productCount] = await db.select({ count: sql<number>`COUNT(*)::int` }).from(products);
    const [inventoryStats] = await db
      .select({
        totalUnits: sql<number>`COALESCE(SUM(available_stock), 0)::int`,
        lowStockItems: sql<number>`COUNT(CASE WHEN available_stock <= low_stock_threshold THEN 1 END)::int`,
      })
      .from(inventory);

    // Recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        totalAmount: orders.totalAmount,
        orderStatus: orders.orderStatus,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8);

    // Best sellers
    const bestSellers = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        unitsSold: sql<number>`SUM(quantity)::int`,
        revenue: sql<string>`SUM(total_price)::text`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`SUM(quantity)`))
      .limit(5);

    // Sales by day chart (last 7 / 30 days)
    const salesByDay = await db
      .select({
        date: sql<string>`TO_CHAR(created_at, 'YYYY-MM-DD')`,
        revenue: sql<number>`COALESCE(SUM(total_amount), 0)::numeric`,
        ordersCount: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .where(and(eq(orders.paymentStatus, 'PAID'), gte(orders.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))))
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM-DD')`);

    res.json({
      totalRevenue: totRevenue.sum,
      todayRevenue: todayRev.sum,
      monthlyRevenue: monthRev.sum,
      totalOrders: orderStats.total || 0,
      pendingOrders: orderStats.pending || 0,
      completedOrders: orderStats.completed || 0,
      totalCustomers: customerCount.count || 0,
      totalProducts: productCount.count || 0,
      totalInventoryUnits: inventoryStats.totalUnits || 0,
      lowStockProducts: inventoryStats.lowStockItems || 0,
      recentOrders,
      bestSellers,
      salesByDay,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to compile analytics' });
  }
});

// -------------------------------------------------------------
// 13. REVIEWS & RATINGS
// -------------------------------------------------------------
api.post('/reviews', async (req, res) => {
  try {
    const { productId, customerId, customerName, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating and comment are required' });
    }

    const [created] = await db
      .insert(reviews)
      .values({
        productId: Number(productId),
        customerId: customerId ? Number(customerId) : null,
        customerName: customerName || 'Verified Buyer',
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        isVerifiedPurchase: true,
        isApproved: true,
      })
      .returning();

    res.json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// -------------------------------------------------------------
// 14. NOTIFICATIONS
// -------------------------------------------------------------
api.get('/admin/notifications', requireAdmin, async (_req, res) => {
  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientType, 'admin'))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

api.put('/admin/notifications/:id/read', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export { api };
