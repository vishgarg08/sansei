import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

type ValidationSchemas = {
  body?: ObjectSchema;
  query?: ObjectSchema;
  params?: ObjectSchema;
};

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

const isObjectSchema = (
  schema: ObjectSchema | ValidationSchemas
): schema is ObjectSchema => typeof (schema as ObjectSchema).validate === "function";

const formatValidationError = (error: ReturnType<ObjectSchema["validate"]>["error"]) =>
  error?.details.map((detail) => detail.message) ?? [];

const setRequestValue = (
  request: Request,
  key: "query" | "params",
  value: unknown
): void => {
  Object.defineProperty(request, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

export const validate =
  (schema: ObjectSchema | ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const schemas = isObjectSchema(schema) ? { body: schema } : schema;

    const bodyResult = schemas.body?.validate(req.body, validationOptions);
    const queryResult = schemas.query?.validate(req.query, validationOptions);
    const paramsResult = schemas.params?.validate(req.params, validationOptions);

    const error =
      bodyResult?.error ?? queryResult?.error ?? paramsResult?.error;

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatValidationError(error),
      });
      return;
    }

    if (bodyResult) {
      req.body = bodyResult.value;
    }

    if (queryResult) {
      setRequestValue(req, "query", queryResult.value);
    }

    if (paramsResult) {
      setRequestValue(req, "params", paramsResult.value);
    }

    next();
  };
