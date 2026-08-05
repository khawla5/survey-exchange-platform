import { Router } from "express";
import { authController } from "@/modules/auth/auth.controller";
import { authRateLimiter, otpRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, authController.register);
router.post("/login", authRateLimiter, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.post("/google", authRateLimiter, authController.google);
router.post("/verify-email", authRateLimiter, authController.verifyEmail);
router.post("/resend-code", otpRateLimiter, authController.resendCode);
router.post("/forgot-password", authRateLimiter, authController.forgotPassword);
router.post("/reset-password", authRateLimiter, authController.resetPassword);

export default router;
