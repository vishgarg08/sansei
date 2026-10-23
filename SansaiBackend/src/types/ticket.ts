import { TicketStatus } from "@prisma/client";

export type CreateTicketInput = {
  subject: string;
  message: string;
  priority?: string;
  attachments?: string | null;
};

export type CustomerTicketListQuery = {
  page: number;
  limit: number;
  status?: TicketStatus;
};

export type AdminTicketListQuery = {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: string;
  search?: string;
};

export type UpdateTicketStatusInput = {
  status: TicketStatus;
  adminResponse?: string | null;
};
