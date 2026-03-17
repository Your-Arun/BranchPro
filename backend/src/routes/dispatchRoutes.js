import { Router } from "express";
import {
  createDispatch,
  getDispatchById,
  listDispatches,
  updateDispatchStatus
} from "../controllers/dispatchController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, listDispatches);
router.get("/:id", protect, getDispatchById);
router.post("/", protect, createDispatch);
router.patch("/:id/status", protect, updateDispatchStatus);

export default router;
