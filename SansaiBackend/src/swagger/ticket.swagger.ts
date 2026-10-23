import { bearerAuth, jsonRef, pathParam, queryParam } from "./helpers";

export const ticketPaths = {
  "/api/v1/tickets": {
    post: {
      tags: ["Tickets"],
      operationId: "createTicket",
      summary: "Raise a new support ticket",
      description: "Creates a new support ticket for the authenticated user.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateTicketRequest"),
      },
      responses: {
        "201": {
          description: "Ticket raised successfully",
          content: jsonRef("#/components/schemas/TicketResponse"),
        },
        "400": {
          description: "Validation error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    get: {
      tags: ["Tickets"],
      operationId: "getTickets",
      summary: "List tickets raised by the user",
      description: "Retrieves a paginated list of tickets raised by the authenticated user.",
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1 }, "Page number"),
        queryParam("limit", { type: "integer", default: 10 }, "Limit per page"),
        queryParam("status", { type: "string" }, "Filter by status"),
      ],
      responses: {
        "200": {
          description: "Tickets retrieved successfully",
          content: jsonRef("#/components/schemas/TicketListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/tickets/{id}": {
    get: {
      tags: ["Tickets"],
      operationId: "getTicketById",
      summary: "Get support ticket details",
      description: "Retrieves details of a specific ticket raised by the authenticated user.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Ticket ID")],
      responses: {
        "200": {
          description: "Ticket retrieved successfully",
          content: jsonRef("#/components/schemas/TicketResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Ticket not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/tickets/{id}/close": {
    patch: {
      tags: ["Tickets"],
      operationId: "closeTicketByUser",
      summary: "Close support ticket",
      description: "Closes a specific ticket raised by the authenticated user.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Ticket ID")],
      responses: {
        "200": {
          description: "Ticket closed successfully",
          content: jsonRef("#/components/schemas/TicketResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Ticket not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/admin/tickets": {
    get: {
      tags: ["Admin Tickets"],
      operationId: "getAdminTickets",
      summary: "List all support tickets (Admin)",
      description: "Retrieves a paginated list of all support tickets with filters.",
      security: bearerAuth,
      parameters: [
        queryParam("page", { type: "integer", default: 1 }, "Page number"),
        queryParam("limit", { type: "integer", default: 20 }, "Limit per page"),
        queryParam("status", { type: "string" }, "Filter by status"),
        queryParam("priority", { type: "string" }, "Filter by priority"),
        queryParam("search", { type: "string" }, "Search query"),
      ],
      responses: {
        "200": {
          description: "Tickets retrieved successfully",
          content: jsonRef("#/components/schemas/TicketListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/admin/tickets/{id}": {
    get: {
      tags: ["Admin Tickets"],
      operationId: "getAdminTicketById",
      summary: "Get support ticket details (Admin)",
      description: "Retrieves details of any specific support ticket.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Ticket ID")],
      responses: {
        "200": {
          description: "Ticket retrieved successfully",
          content: jsonRef("#/components/schemas/TicketResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Ticket not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    patch: {
      tags: ["Admin Tickets"],
      operationId: "updateTicketStatus",
      summary: "Update support ticket status / reply (Admin)",
      description: "Allows admin to change ticket status and submit/update the response.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Ticket ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateTicketStatusRequest"),
      },
      responses: {
        "200": {
          description: "Ticket status updated successfully",
          content: jsonRef("#/components/schemas/TicketResponse"),
        },
        "400": {
          description: "Validation error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "403": {
          description: "Forbidden",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Ticket not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
