import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import { applyCoupon } from "./coupon.service";
import { razorpay } from "../config/razorpay";
import { env } from "../config/env";

// ─── Constants ──────────────────────────────────────────────────────────────

const TAX_RATE = 0.18; // 18% GST
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 49;

// ─── Types ──────────────────────────────────────────────────────────────────

type CheckoutInput = {
  addressId: number;
  couponCode?: string;
  paymentMethod: "RAZORPAY" | "COD";
  customerNotes?: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TT-${timestamp}-${random}`;
};

// ─── Main Checkout Logic ────────────────────────────────────────────────────

export const processCheckout = async (userId: number, input: CheckoutInput) => {
  // ─── Step 0: Validate address ─────────────────────────────────────────
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
  });

  if (!address) {
    throw new AppError("Delivery address not found or does not belong to you", 404);
  }

  // ─── Step 1: Validate cart ────────────────────────────────────────────
  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          discountPrice: true,
          isActive: true,
          deletedAt: true,
        },
      },
      variant: {
        select: {
          id: true,
          size: true,
          color: true,
          sku: true,
          price: true,
          stock: true,
          reservedStock: true,
          productId: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }

  // ─── Step 2: Validate stock ───────────────────────────────────────────
  const stockErrors: string[] = [];

  for (const item of cartItems) {
    if (!item.product.isActive || item.product.deletedAt) {
      stockErrors.push(`"${item.product.name}" is no longer available`);
      continue;
    }

    const availableStock = item.variant.stock - item.variant.reservedStock;

    if (availableStock < item.quantity) {
      if (availableStock === 0) {
        stockErrors.push(
          `"${item.product.name}" (${item.variant.size}/${item.variant.color}) is out of stock`
        );
      } else {
        stockErrors.push(
          `"${item.product.name}" (${item.variant.size}/${item.variant.color}) only has ${availableStock} units available`
        );
      }
    }
  }

  if (stockErrors.length > 0) {
    throw new AppError("Some items in your cart have stock issues", 400, stockErrors);
  }

  // ─── Step 3: Calculate pricing ────────────────────────────────────────
  let subtotal = 0;
  const orderItemsData: Array<{
    productId: number;
    variantId: number;
    quantity: number;
    unitPrice: Prisma.Decimal;
    discountPerUnit: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
    size: string;
    color: string;
  }> = [];

  for (const item of cartItems) {
    const sellingPrice = Number(
      item.product.discountPrice ?? item.variant.price ?? item.product.basePrice
    );
    const basePrice = Number(item.product.basePrice);
    const discountPerUnit = Math.max(0, basePrice - sellingPrice);
    const itemTotal = sellingPrice * item.quantity;
    subtotal += itemTotal;

    orderItemsData.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: new Prisma.Decimal(sellingPrice.toFixed(2)),
      discountPerUnit: new Prisma.Decimal(discountPerUnit.toFixed(2)),
      totalPrice: new Prisma.Decimal(itemTotal.toFixed(2)),
      size: item.variant.size,
      color: item.variant.color,
    });
  }

  subtotal = Math.round(subtotal * 100) / 100;

  // ─── Step 4: Apply coupon (optional) ──────────────────────────────────
  let discountAmount = 0;
  let couponCode: string | null = null;

  if (input.couponCode) {
    const couponResult = await applyCoupon(userId, input.couponCode, subtotal);
    discountAmount = couponResult.discount;
    couponCode = input.couponCode.trim().toUpperCase();
  }

  // ─── Step 5: Calculate totals ─────────────────────────────────────────
  const taxAmount = Math.round((subtotal - discountAmount) * TAX_RATE * 100) / 100;
  const shippingCharges = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const totalAmount =
    Math.round((subtotal - discountAmount + taxAmount + shippingCharges) * 100) / 100;

  // ─── Step 6: Create order inside a transaction ────────────────────────
  const result = await prisma.$transaction(async (tx) => {
    // Re-validate stock inside transaction to prevent race conditions
    for (const item of cartItems) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, reservedStock: true },
      });

      if (!variant) {
        throw new AppError(`Variant not found for "${item.product.name}"`, 404);
      }

      const available = variant.stock - variant.reservedStock;
      if (available < item.quantity) {
        throw new AppError(
          `"${item.product.name}" (${item.variant.size}/${item.variant.color}) went out of stock`,
          409
        );
      }
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: input.addressId,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        discountAmount: new Prisma.Decimal(discountAmount.toFixed(2)),
        shippingCharges: new Prisma.Decimal(shippingCharges.toFixed(2)),
        taxAmount: new Prisma.Decimal(taxAmount.toFixed(2)),
        totalAmount: new Prisma.Decimal(totalAmount.toFixed(2)),
        couponCode,
        paymentMethod: input.paymentMethod,
        status: "PENDING",
        paymentStatus: "PENDING",
        customerNotes: input.customerNotes || null,
      },
    });

    // Create order items
    await tx.orderItem.createMany({
      data: orderItemsData.map((item) => ({
        orderId: order.id,
        ...item,
      })),
    });

    // Reserve inventory
    for (const item of cartItems) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, reservedStock: true },
      });

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          reservedStock: { increment: item.quantity },
        },
      });

      // Create inventory log
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          action: "OUT",
          quantityChanged: item.quantity,
          previousStock: variant!.stock,
          newStock: variant!.stock,
          reference: `ORDER:${order.orderNumber}`,
          notes: `Reserved ${item.quantity} unit(s) for order ${order.orderNumber}`,
        },
      });
    }

    // Create initial timeline
    await tx.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        notes: "Order placed successfully",
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: input.paymentMethod,
        amount: new Prisma.Decimal(totalAmount.toFixed(2)),
        status: "PENDING",
      },
    });

    // Increment coupon usage
    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { totalUsed: { increment: 1 } },
      });
    }

    // Clear cart for COD orders
    if (input.paymentMethod === "COD") {
      await tx.cart.deleteMany({
        where: { userId },
      });
    }

    return order;
  });

  // ─── Step 7: Create Razorpay order (outside transaction) ──────────────
  let razorpayOrder: any = null;

  if (input.paymentMethod === "RAZORPAY") {
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // Razorpay expects paise
        currency: "INR",
        receipt: result.orderNumber,
        notes: {
          orderId: result.id.toString(),
          orderNumber: result.orderNumber,
          userId: userId.toString(),
        },
      });

      // Store Razorpay order ID in payment
      await prisma.payment.update({
        where: { orderId: result.id },
        data: {
          transactionId: razorpayOrder.id,
          gatewayResponse: razorpayOrder as any,
        },
      });
    } catch (error: any) {
      // If Razorpay fails, still return order but flag it
      throw new AppError(
        "Order created but payment gateway is unavailable. Please try again.",
        502,
        { orderId: result.id, orderNumber: result.orderNumber }
      );
    }
  }

  // ─── Response ─────────────────────────────────────────────────────────
  return {
    order: {
      id: result.id,
      orderNumber: result.orderNumber,
      status: result.status,
      paymentStatus: result.paymentStatus,
      paymentMethod: result.paymentMethod,
      subtotal: Number(result.subtotal),
      discountAmount: Number(result.discountAmount),
      taxAmount: Number(result.taxAmount),
      shippingCharges: Number(result.shippingCharges),
      totalAmount: Number(result.totalAmount),
      couponCode: result.couponCode,
      createdAt: result.createdAt,
    },
    payment: razorpayOrder
      ? {
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: env.razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        }
      : null,
  };
};
