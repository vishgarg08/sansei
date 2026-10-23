import { NextFunction, Request, Response } from "express";
import {
  getAdminTickets as getAdminTicketsService,
  getAdminTicketById as getAdminTicketByIdService,
  updateTicketStatusByAdmin as updateTicketStatusByAdminService,
} from "../services/ticket.service";

export const getAdminTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await getAdminTicketsService(req.query as any);

    res.status(200).json({
      success: true,
      data: data.tickets,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const data = await getAdminTicketByIdService(ticketId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticketId = Number(req.params.id);
    const adminId = req.user!.id;
    const data = await updateTicketStatusByAdminService(ticketId, adminId, req.body);

    res.status(200).json({
      success: true,
      message: `Support ticket status updated to ${req.body.status}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};
