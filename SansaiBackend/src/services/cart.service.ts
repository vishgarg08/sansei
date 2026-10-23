import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";

// ─── Types ──────────────────────────────────────────────────────────────────

type AddToCartInput = {
  productId: number;
  variantId: number;
  quantity: number;
};

type UpdateCartInput = {
  quantity: number;
};

// ─── Prisma selects ─────────────────────────────────────────────────────────

const cartItemSelect = Prisma.validator<Prisma.CartSelect>()({
  id: true,
  userId: true,
  productId: true,
  variantId: true,
  quantity: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      discountPrice: true,
      isActive: true,
      deletedAt: true,
      images: {
        where: { isPrimary: true },
        select: { imageUrl: true },
        take: 1,
      },
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
    },
  },
});

type CartItemRecord = Prisma.CartGetPayload<{ select: typeof cartItemSelect }>;

// ─── Serializer ─────────────────────────────────────────────────────────────

const serializeCartItem = (item: CartItemRecord) => {
  const sellingPrice = item.product.discountPrice ?? item.variant.price ?? item.product.basePrice;
  const availableStock = item.variant.stock - item.variant.reservedStock;

  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    quantity: item.quantity,
    productName: item.product.name,
    slug: item.product.slug,
    image: item.product.images[0]?.imageUrl ?? null,
    price: Number(item.product.basePrice),
    discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
    sellingPrice: Number(sellingPrice),
    size: item.variant.size,
    color: item.variant.color,
    sku: item.variant.sku,
    stock: availableStock,
    itemTotal: Number(sellingPrice) * item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

// ─── Validators ─────────────────────────────────────────────────────────────

const validateProductAndVariant = async (
  productId: number,
  variantId: number,
  requestedQuantity: number
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, deletedAt: true, name: true },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (!product.isActive || product.deletedAt) {
    throw new AppError("Product is no longer available", 400);
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { id: true, productId: true, stock: true, reservedStock: true },
  });

  if (!variant) {
    throw new AppError("Product variant not found", 404);
  }

  if (variant.productId !== productId) {
    throw new AppError("Variant does not belong to the specified product", 400);
  }

  const availableStock = variant.stock - variant.reservedStock;

  if (availableStock < requestedQuantity) {
    throw new AppError(
      availableStock === 0
        ? "This variant is currently out of stock"
        : `Only ${availableStock} units available in stock`,
      400
    );
  }

  return { product, variant };
};

// ─── Service Methods ────────────────────────────────────────────────────────

export const addToCart = async (userId: number, input: AddToCartInput) => {
  await validateProductAndVariant(input.productId, input.variantId, input.quantity);

  // Check if same variant is already in cart → increment quantity
  const existingItem = await prisma.cart.findUnique({
    where: {
      userId_variantId: {
        userId,
        variantId: input.variantId,
      },
    },
    select: { id: true, quantity: true },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + input.quantity;

    // Re-validate stock for the combined quantity
    await validateProductAndVariant(input.productId, input.variantId, newQuantity);

    const updated = await prisma.cart.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      select: cartItemSelect,
    });

    return serializeCartItem(updated);
  }

  const cartItem = await prisma.cart.create({
    data: {
      userId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    },
    select: cartItemSelect,
  });

  return serializeCartItem(cartItem);
};

export const getCart = async (userId: number) => {
  const items = await prisma.cart.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: cartItemSelect,
  });

  const serialized = items.map(serializeCartItem);

  const cartTotal = serialized.reduce((sum, item) => sum + item.itemTotal, 0);
  const totalItems = serialized.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: serialized,
    totalItems,
    cartTotal: Math.round(cartTotal * 100) / 100,
  };
};

export const updateCartItem = async (
  userId: number,
  cartItemId: number,
  input: UpdateCartInput
) => {
  const existingItem = await prisma.cart.findFirst({
    where: { id: cartItemId, userId },
    select: { id: true, productId: true, variantId: true },
  });

  if (!existingItem) {
    throw new AppError("Cart item not found", 404);
  }

  // Validate stock for new quantity
  await validateProductAndVariant(existingItem.productId, existingItem.variantId, input.quantity);

  const updated = await prisma.cart.update({
    where: { id: cartItemId },
    data: { quantity: input.quantity },
    select: cartItemSelect,
  });

  return serializeCartItem(updated);
};

export const removeCartItem = async (
  userId: number,
  cartItemId: number
): Promise<void> => {
  const existingItem = await prisma.cart.findFirst({
    where: { id: cartItemId, userId },
    select: { id: true },
  });

  if (!existingItem) {
    throw new AppError("Cart item not found", 404);
  }

  await prisma.cart.delete({
    where: { id: cartItemId },
  });
};

export const clearCart = async (userId: number): Promise<void> => {
  await prisma.cart.deleteMany({
    where: { userId },
  });
};
