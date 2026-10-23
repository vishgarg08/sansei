import Joi from "joi";

const password = Joi.string()
  .min(12)
  .max(72)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
  .messages({
    "string.pattern.base":
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    "string.min": "Password must be at least 12 characters long",
  });

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: password.required(),
  phone: Joi.string().trim().pattern(/^[0-9]{8,15}$/).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

export const googleLoginSchema = Joi.object({
  token: Joi.string().trim().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required(),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().trim().required(),
});
