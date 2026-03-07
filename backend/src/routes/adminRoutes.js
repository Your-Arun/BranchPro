import { Router } from "express";
import {
  createBranch,
  deleteBranch,
  getBranches,
  updateBranch
} from "../controllers/branchController.js";
import { createUser, getUsers } from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/branches", getBranches);
router.post("/branches", createBranch);
router.put("/branches/:id", updateBranch);
router.delete("/branches/:id", deleteBranch);

router.get("/users", getUsers);
router.post("/users", createUser);

export default router;
