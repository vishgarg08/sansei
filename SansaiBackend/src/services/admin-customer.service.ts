import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";

type CustomerListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: "all" | "active" | "inactive";
};

export const getAdminCustomers = async (query: CustomerListQuery) => {
  const { page = 1, limit = 20, search, status = "all" } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.AuthWhereInput = {
    role: "CUSTOMER",
    deletedAt: null,
    ...(status === "active" && { isActive: true }),
    ...(status === "inactive" && { isActive: false }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.auth.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        customerProfile: {
          select: {
            totalSpent: true,
            totalOrders: true,
            lastOrderDate: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auth.count({ where }),
  ]);

  const serializedCustomers = customers.map((c) => {
    // Calculate total spent across non-cancelled orders
    const totalSpent = c.orders.reduce((sum, ord) => {
      if (ord.status !== "CANCELLED") {
        return sum + Number(ord.totalAmount);
      }
      return sum;
    }, 0);

    return {
      id: c.id,
      customerId: `CUST-${String(c.id).padStart(3, "0")}`,
      name: c.name,
      email: c.email,
      phone: c.phone || "N/A",
      totalOrders: c._count.orders,
      totalSpent: Math.round(totalSpent * 100) / 100,
      status: c.isActive ? ("Active" as const) : ("Inactive" as const),
      createdAt: c.createdAt,
    };
  });

  const totalPages = Math.ceil(total / limit);

  return {
    customers: serializedCustomers,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getAdminCustomerById = async (id: number) => {
  const customer = await prisma.auth.findFirst({
    where: {
      id,
      role: "CUSTOMER",
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      addresses: {
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
          isDefault: true,
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          totalAmount: true,
          createdAt: true,
          _count: {
            select: { items: true },
          },
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const totalSpent = customer.orders.reduce((sum, ord) => {
    if (ord.status !== "CANCELLED") {
      return sum + Number(ord.totalAmount);
    }
    return sum;
  }, 0);

  const nameParts = customer.name.trim().split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
      : customer.name.substring(0, 2).toUpperCase();

  const since = new Date(customer.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    id: customer.id,
    customerId: `CUST-${String(customer.id).padStart(3, "0")}`,
    name: customer.name,
    initials,
    email: customer.email,
    phone: customer.phone || "N/A",
    since,
    totalOrders: customer._count.orders,
    totalSpent: Math.round(totalSpent * 100) / 100,
    status: customer.isActive ? ("Active" as const) : ("Inactive" as const),
    addresses: customer.addresses,
    recentOrders: customer.orders.map((ord) => ({
      id: ord.id,
      orderNumber: ord.orderNumber,
      date: new Date(ord.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      total: Number(ord.totalAmount),
      status: ord.status,
      itemsCount: ord._count.items,
    })),
  };
};
