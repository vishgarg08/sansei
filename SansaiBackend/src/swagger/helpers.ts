export const jsonRef = (ref: string) => ({
  "application/json": {
    schema: { $ref: ref },
  },
});

export const pathParam = (
  name: string,
  schema: Record<string, unknown>,
  description?: string
) => ({
  in: "path",
  name,
  required: true,
  ...(description ? { description } : {}),
  schema,
});

export const queryParam = (
  name: string,
  schema: Record<string, unknown>,
  description?: string
) => ({
  in: "query",
  name,
  ...(description ? { description } : {}),
  schema,
});

export const bearerAuth = [{ bearerAuth: [] }];
