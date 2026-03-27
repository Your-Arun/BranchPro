import { Router } from "express";
import {
  listGeneralEntries,
  getGeneralEntryById,
  createGeneralEntry,
  updateGeneralEntry,
  deleteGeneralEntry,
  getEntryStats
} from "../controllers/generalEntryController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All routes are protected
router.use(protect);

// CRUD operations
router.get("/", listGeneralEntries);
router.get("/stats", getEntryStats);
router.get("/:id", getGeneralEntryById);
router.post("/", createGeneralEntry);
router.put("/:id", updateGeneralEntry);
router.delete("/:id", deleteGeneralEntry);

export default router;