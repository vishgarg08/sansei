import { bearerAuth, jsonRef, pathParam } from "./helpers";

export const addressPaths = {
  "/api/v1/addresses": {
    post: {
      tags: ["Addresses"],
      operationId: "createAddress",
      summary: "Create a new customer address",
      description:
        "Saves a new shipping/billing address for the authenticated user. If set as default, or if it is the user's first address, it unsets other addresses as default.",
      security: bearerAuth,
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/CreateAddressRequest"),
      },
      responses: {
        "201": {
          description: "Address created successfully",
          content: jsonRef("#/components/schemas/AddressMutationResponse"),
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
      tags: ["Addresses"],
      operationId: "getAddresses",
      summary: "List all addresses of the customer",
      description:
        "Retrieves a list of all addresses saved by the authenticated customer. The list is sorted such that the default address appears first.",
      security: bearerAuth,
      responses: {
        "200": {
          description: "Addresses retrieved successfully",
          content: jsonRef("#/components/schemas/AddressListResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
  "/api/v1/addresses/{id}": {
    patch: {
      tags: ["Addresses"],
      operationId: "updateAddress",
      summary: "Update an address details",
      description:
        "Modifies an existing address for the authenticated customer. If the address is set as default, other addresses for the customer will be updated to not be default.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Address ID")],
      requestBody: {
        required: true,
        content: jsonRef("#/components/schemas/UpdateAddressRequest"),
      },
      responses: {
        "200": {
          description: "Address updated successfully",
          content: jsonRef("#/components/schemas/AddressMutationResponse"),
        },
        "400": {
          description: "Validation or format error",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Address not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
    delete: {
      tags: ["Addresses"],
      operationId: "deleteAddress",
      summary: "Delete a customer address",
      description:
        "Removes the specified address. If the deleted address was set as the default one, the system automatically sets the user's most recently created remaining address as the new default.",
      security: bearerAuth,
      parameters: [pathParam("id", { type: "integer" }, "Address ID")],
      responses: {
        "200": {
          description: "Address deleted successfully",
          content: jsonRef("#/components/schemas/DeleteResponse"),
        },
        "401": {
          description: "Unauthorized",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
        "404": {
          description: "Address not found",
          content: jsonRef("#/components/schemas/ErrorResponse"),
        },
      },
    },
  },
};
