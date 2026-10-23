import { prisma } from "../prisma/prisma";

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getAdminDashboard = async () => {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    revenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    ordersInRange,
    recentOrders,
    categories,
    variants,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "SUCCESS" },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.auth.count({ where: { role: "CUSTOMER", deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PACKED"] } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, totalAmount: true, paymentStatus: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.category.findMany({
      take: 6,
      orderBy: { products: { _count: "desc" } },
      select: { id: true, name: true, _count: { select: { products: true } } },
    }),
    prisma.productVariant.findMany({ select: { stock: true, reservedStock: true } }),
  ]);

  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    monthlyMap.set(monthKey(date), { revenue: 0, orders: 0 });
  }

  for (const order of ordersInRange) {
    const point = monthlyMap.get(monthKey(order.createdAt));
    if (!point) continue;
    point.orders += 1;
    if (order.paymentStatus === "SUCCESS") point.revenue += Number(order.totalAmount);
  }

  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const reservedStock = variants.reduce((sum, variant) => sum + variant.reservedStock, 0);
  const lowStock = variants.filter((variant) => variant.stock - variant.reservedStock <= 10).length;

  return {
    summary: {
      totalRevenue: Number(revenue._sum.totalAmount ?? 0),
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      totalStock,
      reservedStock,
      lowStock,
    },
    monthlySales: Array.from(monthlyMap.entries()).map(([key, value]) => ({
      key,
      label: new Date(`${key}-01T00:00:00`).toLocaleString("en-IN", { month: "short" }),
      ...value,
    })),
    categoryDistribution: categories.map((category) => ({
      id: category.id,
      name: category.name,
      products: category._count.products,
    })),
    recentOrders: recentOrders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    })),
  };
};
