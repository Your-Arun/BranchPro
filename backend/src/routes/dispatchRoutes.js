import { Router } from "express";
import {
  createDispatch,
  getDispatchById,
  listDispatches,
  updateDispatchStatus
} from "../controllers/dispatchController.js";

const router = Router();

router.get("/", listDispatches);
router.get("/:id", getDispatchById);
router.post("/", createDispatch);
router.patch("/:id/status", updateDispatchStatus);

export default router;
