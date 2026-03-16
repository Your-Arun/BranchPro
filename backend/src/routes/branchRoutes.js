import { Router } from "express";
import { getBranches } from "../controllers/branchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getBranches);

export default router;
