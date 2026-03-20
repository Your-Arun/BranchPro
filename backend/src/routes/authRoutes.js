import { loginUser, registerUser, adminRegister, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginUser);
router.post("/signup", registerUser);       // Staff with key
router.post("/register", registerUser);     // Alias for Staff
router.post("/admin-signup", adminRegister); // New Admin
router.get("/me", protect, getProfile);

export default router;
