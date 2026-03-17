import { Router } from "express";
import { getReports } from "../controllers/reportsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getReports);

export default router;
