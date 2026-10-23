import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import { env } from "../config/env";

// ─── Types ──────────────────────────────────────────────────────────────────

type VerifyPaymentInput = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type PaymentFailureInput = {
  razorpay_order_id: string;
  errorCode?: string;
  errorDescription?: string;
};

// ─── Verify Razorpay Payment ────────────────────────────────────────────────

export const verifyPayment = async (userId: number, input: VerifyPaymentInput) => {
  // 1. Find payment by Razorpay order ID
  const payment = await prisma.payment.findFirst({
    where: { transactionId: input.razorpay_order_id },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: true,
              product: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  // 2. Validate order belongs to user
  if (payment.order.userId !== userId) {
    throw new AppError("Unauthorized: This order does not belong to you", 403);
  }

  // 3. Prevent double processing
  if (payment.status === "SUCCESS") {
    throw new AppError("Payment has already been processed", 400);
  }

  // 4. Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== input.razorpay_signature) {
    // Mark as failed on signature mismatch
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        errorMessage: "Payment signature verification failed",
        retries: { increment: 1 },
      },
    });

    throw new AppError("Payment verification failed: Invalid signature", 400);
  }

  // 5. Process payment success in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update payment
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        transactionId: input.razorpay_payment_id,
        gatewayResponse: {
          razorpay_order_id: input.razorpay_order_id,
          razorpay_payment_id: input.razorpay_payment_id,
          razorpay_signature: input.razorpay_signature,
          verified_at: new Date().toISOString(),
        },
      },
    });

    // Update order
    const updatedOrder = await tx.order.update({
      where: { id: payment.order.id },
      data: {
        paymentStatus: "SUCCESS",
        status: "CONFIRMED",
      },
    });

    // Reduce actual stock and release reserved stock for each item
    for (const item of payment.order.items) {
      if (!item.variantId) continue;

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, reservedStock: true },
      });

      if (!variant) continue;

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
          reservedStock: { decrement: item.quantity },
        },
      });

      // Create inventory log
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          action: "OUT",
          quantityChanged: item.quantity,
          previousStock: variant.stock,
          newStock: variant.stock - item.quantity,
          reference: `PAYMENT:${input.razorpay_payment_id}`,
          notes: `Stock reduced after payment confirmation for order ${updatedOrder.orderNumber}`,
        },
      });

      // Update product totalSold
      await tx.product.update({
        where: { id: item.productId },
        data: {
          totalSold: { increment: item.quantity },
        },
      });
    }

    // Clear cart
    await tx.cart.deleteMany({
      where: { userId },
    });

    // Create timeline
    await tx.orderTimeline.create({
      data: {
        orderId: payment.order.id,
        status: "CONFIRMED",
        notes: `Payment confirmed via Razorpay (${input.razorpay_payment_id})`,
      },
    });

    // Update customer profile
    await tx.customerProfile.updateMany({
      where: { authId: userId },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: Number(updatedOrder.totalAmount) },
        lastOrderDate: new Date(),
      },
    });

    return updatedOrder;
  });

  return {
    orderId: result.id,
    orderNumber: result.orderNumber,
    status: result.status,
    paymentStatus: result.paymentStatus,
    totalAmount: Number(result.totalAmount),
  };
};

// ─── Handle Payment Failure ─────────────────────────────────────────────────

export const handlePaymentFailure = async (userId: number, input: PaymentFailureInput) => {
  // 1. Find payment by Razorpay order ID
  const payment = await prisma.payment.findFirst({
    where: { transactionId: input.razorpay_order_id },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  // 2. Validate order belongs to user
  if (payment.order.userId !== userId) {
    throw new AppError("Unauthorized: This order does not belong to you", 403);
  }

  // 3. Prevent double processing
  if (payment.status === "SUCCESS") {
    throw new AppError("Payment has already been processed successfully", 400);
  }

  if (payment.status === "FAILED" && payment.order.status === "CANCELLED") {
    throw new AppError("Payment failure has already been processed", 400);
  }

  // 4. Process failure in a transaction
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        errorMessage: input.errorDescription || "Payment failed",
        retries: { increment: 1 },
      },
    });

    // Update order
    await tx.order.update({
      where: { id: payment.order.id },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
      },
    });

    // Release reserved stock
    for (const item of payment.order.items) {
      if (!item.variantId) continue;

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, reservedStock: true },
      });

      if (!variant) continue;

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          reservedStock: { decrement: item.quantity },
        },
      });

      // Create inventory log
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          action: "CANCELLED",
          quantityChanged: item.quantity,
          previousStock: variant.stock,
          newStock: variant.stock,
          reference: `PAYMENT_FAILED:${input.razorpay_order_id}`,
          notes: `Reserved stock released after payment failure: ${input.errorDescription || "Payment failed"}`,
        },
      });
    }

    // Decrement coupon usage if one was applied
    if (payment.order.couponCode) {
      await tx.coupon.update({
        where: { code: payment.order.couponCode },
        data: { totalUsed: { decrement: 1 } },
      });
    }

    // Create timeline
    await tx.orderTimeline.create({
      data: {
        orderId: payment.order.id,
        status: "CANCELLED",
        notes: `Order cancelled due to payment failure: ${input.errorCode || "UNKNOWN"} - ${input.errorDescription || "Payment failed"}`,
      },
    });
  });

  return {
    orderId: payment.order.id,
    orderNumber: payment.order.orderNumber,
    status: "CANCELLED",
    paymentStatus: "FAILED",
    message: "Payment failed and order has been cancelled. Reserved stock has been released.",
  };
};
