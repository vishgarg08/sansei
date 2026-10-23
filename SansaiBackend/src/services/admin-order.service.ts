import { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";

// ─── Types ──────────────────────────────────────────────────────────────────

type AdminOrderListQuery = {
  page: number;
  limit: number;
  status?: OrderStatus;
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  userId?: number;
  search?: string;
};

type UpdateStatusInput = {
  status: OrderStatus;
  notes?: string;
  shippingTrackingId?: string;
};

// ─── Valid Status Transitions ───────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURN_REQUESTED"],
  CANCELLED: [],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  RETURNED: [],
};

// ─── Selects ────────────────────────────────────────────────────────────────

const adminOrderListSelect = Prisma.validator<Prisma.OrderSelect>()({
  id: true,
  orderNumber: true,
  userId: true,
  status: true,
  paymentStatus: true,
  paymentMethod: true,
  subtotal: true,
  discountAmount: true,
  taxAmount: true,
  shippingCharges: true,
  totalAmount: true,
  couponCode: true,
  shippingTrackingId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  items: {
    select: {
      id: true,
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

const adminOrderDetailSelect = Prisma.validator<Prisma.OrderSelect>()({
  ...adminOrderListSelect,
  addressId: true,
  estimatedDelivery: true,
  deliveredAt: true,
  customerNotes: true,
  internalNotes: true,
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
      errorMessage: true,
      retries: true,
      gatewayResponse: true,
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

const serializeAdminOrderItem = (item: any) => ({
  id: item.id,
  quantity: item.quantity,
  unitPrice: Number(item.unitPrice),
  totalPrice: Number(item.totalPrice),
  size: item.size,
  color: item.color,
  productId: item.product?.id,
  productName: item.product?.name,
  productSlug: item.product?.slug,
  productImage: item.product?.images?.[0]?.imageUrl ?? null,
});

const serializeAdminOrder = (order: any) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  userId: order.userId,
  status: order.status,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  subtotal: Number(order.subtotal),
  discountAmount: Number(order.discountAmount),
  taxAmount: Number(order.taxAmount),
  shippingCharges: Number(order.shippingCharges),
  totalAmount: Number(order.totalAmount),
  couponCode: order.couponCode,
  shippingTrackingId: order.shippingTrackingId,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  customer: order.user,
  items: order.items?.map(serializeAdminOrderItem) ?? [],
  // Detail fields
  ...(order.address !== undefined && {
    addressId: order.addressId,
    estimatedDelivery: order.estimatedDelivery,
    deliveredAt: order.deliveredAt,
    customerNotes: order.customerNotes,
    internalNotes: order.internalNotes,
    address: order.address,
    payment: order.payment
      ? {
          id: order.payment.id,
          paymentMethod: order.payment.paymentMethod,
          transactionId: order.payment.transactionId,
          amount: Number(order.payment.amount),
          status: order.payment.status,
          errorMessage: order.payment.errorMessage,
          retries: order.payment.retries,
          createdAt: order.payment.createdAt,
          updatedAt: order.payment.updatedAt,
        }
      : null,
    timelines: order.timelines ?? [],
  }),
});

// ─── Service Methods ────────────────────────────────────────────────────────

export const getAdminOrders = async (query: AdminOrderListQuery) => {
  const { page, limit, status, paymentStatus, userId, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(userId && { userId }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: "insensitive" as const } },
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: adminOrderListSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(serializeAdminOrder),
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

export const getAdminOrderById = async (orderId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: adminOrderDetailSelect,
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return serializeAdminOrder(order);
};

export const updateOrderStatus = async (
  orderId: number,
  input: UpdateStatusInput,
  adminId: number
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { variant: true },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Validate status transition
  const allowedTransitions = VALID_TRANSITIONS[order.status];
  if (!allowedTransitions.includes(input.status)) {
    throw new AppError(
      `Cannot transition from "${order.status}" to "${input.status}". Allowed: ${allowedTransitions.join(", ") || "none"}`,
      400
    );
  }

  await prisma.$transaction(async (tx) => {
    const updateData: Prisma.OrderUpdateInput = {
      status: input.status,
    };

    // Handle specific status logic
    if (input.status === "SHIPPED") {
      const estimated = new Date();
      estimated.setDate(estimated.getDate() + 5);
      updateData.estimatedDelivery = estimated;
      if (input.shippingTrackingId) {
        updateData.shippingTrackingId = input.shippingTrackingId;
      }
    }

    if (input.status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    // ─── Return Approved: Restore stock ────────────────────────────────────
    if (input.status === "RETURNED") {
      for (const item of order.items) {
        if (!item.variantId) continue;

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, reservedStock: true },
        });

        if (!variant) continue;

        // Restore stock back to shelf
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });

        // Create RETURN inventory log — always, for every return
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            action: "RETURN",
            quantityChanged: item.quantity,
            previousStock: variant.stock,
            newStock: variant.stock + item.quantity,
            reference: `RETURN:${order.orderNumber}`,
            notes: `Stock restored on return approval${input.notes ? `: ${input.notes}` : ""}`,
          },
        });

        // Reverse totalSold on product
        await tx.product.update({
          where: { id: item.productId },
          data: { totalSold: { decrement: item.quantity } },
        });
      }

      // Process refund if payment was successful
      if (order.paymentStatus === "SUCCESS" && order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "REFUNDED" },
        });
        updateData.paymentStatus = "REFUNDED";

        // Reverse customer profile stats
        await tx.customerProfile.updateMany({
          where: { authId: order.userId },
          data: {
            totalOrders: { decrement: 1 },
            totalSpent: { decrement: Number(order.totalAmount) },
          },
        });
      }
    }

    if (input.status === "CANCELLED") {
      // Handle stock restoration on admin cancel
      for (const item of order.items) {
        if (!item.variantId) continue;

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, reservedStock: true },
        });

        if (!variant) continue;

        if (order.paymentStatus === "SUCCESS") {
          // Stock was deducted, restore it
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              action: "RETURN",
              quantityChanged: item.quantity,
              previousStock: variant.stock,
              newStock: variant.stock + item.quantity,
              reference: `ADMIN_CANCEL:${order.orderNumber}`,
              notes: `Stock restored by admin cancellation${input.notes ? `: ${input.notes}` : ""}`,
            },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: { totalSold: { decrement: item.quantity } },
          });
        } else {
          // Release reserved stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { reservedStock: { decrement: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              action: "CANCELLED",
              quantityChanged: item.quantity,
              previousStock: variant.stock,
              newStock: variant.stock,
              reference: `ADMIN_CANCEL:${order.orderNumber}`,
              notes: `Reserved stock released by admin cancellation${input.notes ? `: ${input.notes}` : ""}`,
            },
          });
        }
      }

      // Handle payment refund
      if (order.paymentStatus === "SUCCESS" && order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "REFUNDED" },
        });
        updateData.paymentStatus = "REFUNDED";

        // Reverse customer profile stats
        await tx.customerProfile.updateMany({
          where: { authId: order.userId },
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
    }

    // Update order
    await tx.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Create timeline automatically
    await tx.orderTimeline.create({
      data: {
        orderId,
        status: input.status,
        notes: input.notes || `Status updated to ${input.status} by admin`,
        changedByAdminId: adminId,
      },
    });
  });

  // Fetch and return updated order
  const updatedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: adminOrderDetailSelect,
  });

  return serializeAdminOrder(updatedOrder);
};
