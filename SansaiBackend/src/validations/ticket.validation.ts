import Joi from "joi";

export const ticketIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const createTicketSchema = Joi.object({
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(10).max(5000).required(),
  priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "URGENT").default("NORMAL").optional(),
  attachments: Joi.string().trim().max(1000).optional().allow("", null),
});

export const customerTicketListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED").optional(),
});

export const adminTicketListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED").optional(),
  priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "URGENT").optional(),
  search: Joi.string().trim().max(100).optional(),
});

export const updateTicketStatusSchema = Joi.object({
  status: Joi.string().valid("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED").required(),
  adminResponse: Joi.string().trim().max(5000).optional().allow("", null),
});
