import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";

// ─── Types ──────────────────────────────────────────────────────────────────

type OrderListQuery = {
  page: number;
  limit: number;
  status?: OrderStatus;
};

// ─── Prisma selects ─────────────────────────────────────────────────────────

const orderListSelect = Prisma.validator<Prisma.OrderSelect>()({
  id: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  shippingCharges: true,
  totalAmount: true,
  couponCode: true,
  createdAt: true,
  updatedAt: true,
  items: {
    select: {
      id: true,
      productId: true,
      variantId: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      size: true,
      color: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: {
            where: { isPrimary: true },
            select: { imageUrl: true },
            take: 1,
          },
        },
      },
    },
  },
});

const orderDetailSelect = Prisma.validator<Prisma.OrderSelect>()({
  ...orderListSelect,
  addressId: true,
  shippingTrackingId: true,
  estimatedDelivery: true,
  deliveredAt: true,
  customerNotes: true,
  address: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    },
  },
  payment: {
    select: {
      id: true,
      paymentMethod: true,
      transactionId: true,
      amount: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  timelines: {
    select: {
      id: true,
      status: true,
      notes: true,
      changedByAdminId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
});

// ─── Serializers ────────────────────────────────────────────────────────────

const serializeOrderItem = (item: any) => ({
  id: item.id,
  productId: item.productId,
  variantId: item.variantId,
  quantity: item.quantity,
  unitPrice: Number(item.unitPrice),
  totalPrice: Number(item.totalPrice),
  size: item.size,
  color: item.color,
  productName: item.product?.name,
  productSlug: item.product?.slug,
  productImage: item.product?.images?.[0]?.imageUrl ?? null,
});

const serializeOrder = (order: any) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  subtotal: Number(order.subtotal),
  discountAmount: Number(order.discountAmount),
  taxAmount: Number(order.taxAmount),
  shippingCharges: Number(order.shippingCharges),
  totalAmount: Number(order.totalAmount),
  couponCode: order.couponCode,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  items: order.items?.map(serializeOrderItem) ?? [],
  // Detail fields (only present in detail view)
  ...(order.address !== undefined && {
    addressId: order.addressId,
    shippingTrackingId: order.shippingTrackingId,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt,
    customerNotes: order.customerNotes,
    address: order.address,
    payment: order.payment
      ? {
          id: order.payment.id,
          paymentMethod: order.payment.paymentMethod,
          transactionId: order.payment.transactionId,
          amount: Number(order.payment.amount),
          status: order.payment.status,
          createdAt: order.payment.createdAt,
          updatedAt: order.payment.updatedAt,
        }
      : null,
    timelines: order.timelines ?? [],
  }),
});

// ─── Service Methods ────────────────────────────────────────────────────────

export const getOrders = async (userId: number, query: OrderListQuery) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: orderListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeOrder),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

export const getOrderById = async (userId: number, orderId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: orderDetailSelect,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return serializeOrder(order);
};

export const cancelOrder = async (userId: number, orderId: number, reason: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          variant: true,
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Only allow cancellation for PENDING or CONFIRMED orders
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    throw new AppError(
      `Cannot cancel order with status "${order.status}". Only PENDING or CONFIRMED orders can be cancelled.`,
      400
    );
  }

  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        internalNotes: `Customer cancelled: ${reason}`,
      },
    });

    // Handle stock based on payment status
    for (const item of order.items) {
      if (!item.variantId) continue;

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, reservedStock: true },
      });

      if (!variant) continue;

      if (order.paymentStatus === "SUCCESS") {
        // Stock was already deducted — restore it
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { increment: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            action: "RETURN",
            quantityChanged: item.quantity,
            previousStock: variant.stock,
            newStock: variant.stock + item.quantity,
            reference: `CANCEL:${order.orderNumber}`,
            notes: `Stock restored due to order cancellation: ${reason}`,
          },
        });

        // Decrement product totalSold
        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalSold: { decrement: item.quantity },
          },
        });
      } else {
        // Payment not completed — release reserved stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            reservedStock: { decrement: item.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            action: "CANCELLED",
            quantityChanged: item.quantity,
            previousStock: variant.stock,
            newStock: variant.stock,
            reference: `CANCEL:${order.orderNumber}`,
            notes: `Reserved stock released due to order cancellation: ${reason}`,
          },
        });
      }
    }

    // If payment was successful, mark for refund
    if (order.paymentStatus === "SUCCESS" && order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { status: "REFUNDED" },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "REFUNDED" },
      });

      // Reverse customer profile stats
      await tx.customerProfile.updateMany({
        where: { authId: userId },
        data: {
          totalOrders: { decrement: 1 },
          totalSpent: { decrement: Number(order.totalAmount) },
        },
      });
    }

    // Decrement coupon usage
    if (order.couponCode) {
      await tx.coupon.update({
        where: { code: order.couponCode },
        data: { totalUsed: { decrement: 1 } },
      });
    }

    // Create timeline
    await tx.orderTimeline.create({
      data: {
        orderId: order.id,
        status: "CANCELLED",
        notes: `Cancelled by customer: ${reason}`,
      },
    });
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: "CANCELLED",
    message: "Order cancelled successfully",
  };
};
