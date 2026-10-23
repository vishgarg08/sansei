import { NextFunction, Request, Response } from "express";
import {
  createTicket as createTicketService,
  getTickets as getTicketsService,
  getTicketById as getTicketByIdService,
  closeTicketByUser as closeTicketByUserService,
} from "../services/ticket.service";

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await createTicketService(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Support ticket raised successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await getTicketsService(userId, req.query as any);

    res.status(200).json({
      success: true,
      data: data.tickets,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const ticketId = Number(req.params.id);
    const data = await getTicketByIdService(userId, ticketId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const closeTicketByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const ticketId = Number(req.params.id);
    const data = await closeTicketByUserService(userId, ticketId);

    res.status(200).json({
      success: true,
      message: "Ticket closed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
