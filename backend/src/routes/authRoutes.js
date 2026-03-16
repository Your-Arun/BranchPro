import { Router } from "express";
import { loginUser, registerUser, adminRegister } from "../controllers/authController.js";

const router = Router();

router.post("/login", loginUser);
router.post("/signup", registerUser);       // Staff with key
router.post("/register", registerUser);     // Alias for Staff
router.post("/admin-signup", adminRegister); // New Admin

export default router;
