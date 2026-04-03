import { loginUser, registerUser, adminRegister, getProfile, updateProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);
router.post("/signup", registerUser);       // Staff with key
router.post("/register", registerUser);     // Alias for Staff
router.post("/admin-signup", adminRegister); // New Admin
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
