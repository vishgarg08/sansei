import { Router } from "express";
import { prisma } from "../prisma/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, company, inquiryType, requirements } = req.body;
    if (![name, email, phone, company, inquiryType, requirements].every((value) => typeof value === "string" && value.trim())) {
      res.status(400).json({ success: false, message: "All inquiry fields are required" });
      return;
    }
    const inquiry = await prisma.bulkInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        company: company.trim(),
        inquiryType: inquiryType.trim(),
        requirements: requirements.trim(),
      },
    });
    res.status(201).json({ success: true, message: "Your inquiry has been submitted to sensai", data: inquiry });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const inquiries = await prisma.bulkInquiry.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const allowed = ["NEW", "CONTACTED", "QUOTED", "CLOSED"];
    if (!Number.isInteger(id) || !allowed.includes(req.body.status)) {
      res.status(400).json({ success: false, message: "Invalid inquiry update" });
      return;
    }
    const inquiry = await prisma.bulkInquiry.update({
      where: { id },
      data: { status: req.body.status, adminNotes: req.body.adminNotes?.trim() || null },
    });
    res.json({ success: true, data: inquiry });
  } catch (error) {
    next(error);
  }
});

export default router;
