import { bearerAuth, jsonRef } from "./helpers";

export const paymentPaths = {
  "/api/v1/payments/verify": {
    post: {
      operationId: "verifyPayment",
      summary: "Verify Razorpay payment",
      description:
        "Verifies Razorpay payment signature, confirms order, reduces stock, clears cart, and creates timeline entry.",
      tags: ["Payments"],
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/PaymentVerifyRequest"),
      },
      responses: {
        "200": {
          description: "Payment verified successfully",
          content: jsonRef("#/components/schemas/PaymentVerifyResponse"),
        },
        "400": {
          description: "Invalid signature or already processed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Payment record not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/payments/failure": {
    post: {
      operationId: "handlePaymentFailure",
      summary: "Handle payment failure",
      description:
        "Handles payment failure, cancels order, releases reserved stock, and creates timeline entry.",
      tags: ["Payments"],
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/PaymentFailureRequest"),
      },
      responses: {
        "200": {
          description: "Payment failure handled",
          content: jsonRef("#/components/schemas/PaymentFailureResponse"),
        },
        "400": {
          description: "Already processed",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Payment record not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
