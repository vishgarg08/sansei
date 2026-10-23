import { Router } from "express";
import {
  googleLogin,
  login,
  logout,
  me,
  refreshToken,
  register,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  googleLoginSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleLoginSchema), googleLogin);
router.post("/refresh", validate(refreshTokenSchema), refreshToken);
router.post("/logout", validate(logoutSchema), logout);
router.get("/me", requireAuth, me);

export default router;
