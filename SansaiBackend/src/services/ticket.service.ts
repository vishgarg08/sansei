import crypto from "crypto";
import { Prisma, TicketStatus } from "@prisma/client";
import { prisma } from "../prisma/prisma";
import { AppError } from "../utils/appError";
import {
  CreateTicketInput,
  CustomerTicketListQuery,
  AdminTicketListQuery,
  UpdateTicketStatusInput,
} from "../types/ticket";

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateTicketNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// ─── Serializers ────────────────────────────────────────────────────────────

export const serializeTicket = (ticket: any) => ({
  id: ticket.id,
  ticketNumber: ticket.ticketNumber,
  userId: ticket.userId,
  subject: ticket.subject,
  message: ticket.message,
  priority: ticket.priority,
  status: ticket.status,
  adminResponse: ticket.adminResponse,
  attachments: ticket.attachments,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  ...(ticket.user && {
    customer: {
      id: ticket.user.id,
      name: ticket.user.name,
      email: ticket.user.email,
      phone: ticket.user.phone,
    },
  }),
});

// ─── Customer Service Methods ───────────────────────────────────────────────

export const createTicket = async (userId: number, input: CreateTicketInput) => {
  const ticketNumber = generateTicketNumber();

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId,
      subject: input.subject.trim(),
      message: input.message.trim(),
      priority: input.priority || "NORMAL",
      attachments: input.attachments?.trim() || null,
      status: "OPEN",
    },
  });

  return serializeTicket(ticket);
};

export const getTickets = async (userId: number, query: CustomerTicketListQuery) => {
  const { page, limit, status } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.SupportTicketWhereInput = {
    userId,
    ...(status && { status }),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets: tickets.map(serializeTicket),
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

export const getTicketById = async (userId: number, ticketId: number) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
  });

  if (!ticket) {
    throw new AppError("Ticket not found or does not belong to you", 404);
  }

  return serializeTicket(ticket);
};

export const closeTicketByUser = async (userId: number, ticketId: number) => {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
  });

  if (!ticket) {
    throw new AppError("Ticket not found or does not belong to you", 404);
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
  });

  return serializeTicket(updated);
};

// ─── Admin Service Methods ──────────────────────────────────────────────────

export const getAdminTickets = async (query: AdminTicketListQuery) => {
  const { page, limit, status, priority, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.SupportTicketWhereInput = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { ticketNumber: { contains: search, mode: "insensitive" as const } },
        { subject: { contains: search, mode: "insensitive" as const } },
        { message: { contains: search, mode: "insensitive" as const } },
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { user: { email: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    tickets: tickets.map(serializeTicket),
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

export const getAdminTicketById = async (ticketId: number) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  return serializeTicket(ticket);
};

export const updateTicketStatusByAdmin = async (
  ticketId: number,
  adminId: number,
  input: UpdateTicketStatusInput
) => {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: input.status,
      adminResponse: input.adminResponse !== undefined ? input.adminResponse : undefined,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Here, we could optionally add an AdminAuditLog entry, but let's keep it simple and clean first
  return serializeTicket(updated);
};
