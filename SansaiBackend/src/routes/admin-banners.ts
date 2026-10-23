import { Router } from "express";
import { prisma } from "../prisma/prisma";

const router = Router();

const DEFAULT_DB_BANNERS = [
  {
    title: "The cool inner cooling for\nyour tooling.",
    description: "Discover reCool for ER >",
    imageUrl: "/images/recool-cnc-cooling-hero.png",
    linkUrl: "/category/drill-bits-and-taps",
    isActive: true,
    displayOrder: 1,
  },
  {
    title: "High-Precision Micro-Grain\nCarbide End Mills.",
    description: "Explore 5-Axis Milling Solutions >",
    imageUrl: "/images/hero_slider_2.png",
    linkUrl: "/category/end-mills",
    isActive: true,
    displayOrder: 2,
  },
  {
    title: "Precision Through-Spindle\nCooling & Clamping.",
    description: "Triple Tool Life in Harsh Alloys >",
    imageUrl: "/images/hero_slider_1.png",
    linkUrl: "/bulk-inquiry",
    isActive: true,
    displayOrder: 3,
  },
];

// GET all banners (seeds defaults if table is empty)
router.get("/", async (_req, res, next) => {
  try {
    let banners = await prisma.banner.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    if (banners.length === 0) {
      await prisma.banner.createMany({
        data: DEFAULT_DB_BANNERS,
      });
      banners = await prisma.banner.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      });
    }

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
});

// POST create banner
router.post("/", async (req, res, next) => {
  try {
    const { title, description, imageUrl, linkUrl, isActive, displayOrder } = req.body;
    if (!title || !imageUrl) {
      res.status(400).json({ success: false, message: "Title and Image URL are required" });
      return;
    }

    const maxOrder = await prisma.banner.aggregate({
      _max: { displayOrder: true },
    });
    const nextOrder = displayOrder ?? ((maxOrder._max.displayOrder || 0) + 1);

    const banner = await prisma.banner.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        imageUrl: String(imageUrl).trim(),
        linkUrl: linkUrl ? String(linkUrl).trim() : null,
        isActive: isActive !== false,
        displayOrder: Number(nextOrder) || 1,
      },
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
});

// PUT update banner
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, message: "Invalid banner ID" });
      return;
    }

    const { title, description, imageUrl, linkUrl, isActive, displayOrder } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && { description: description ? String(description).trim() : null }),
        ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl ? String(linkUrl).trim() : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    res.json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE banner
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, message: "Invalid banner ID" });
      return;
    }

    await prisma.banner.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
