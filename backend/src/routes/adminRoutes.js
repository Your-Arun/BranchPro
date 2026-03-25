import { Router } from "express";
import { createBranch, deleteBranch, getBranches, updateBranch, bulkDeleteBranches } from "../controllers/branchController.js";
import { createUser, getUsers, updateUser, deleteUser, bulkDeleteUsers } from "../controllers/userController.js";
import { getDispatchById, listDispatches, deleteDispatch, createDispatch, updateDispatchStatus, updateDispatch, bulkDeleteDispatches } from "../controllers/dispatchController.js";
import { createCompany, getMyCompany, updateCompany, deleteCompany } from "../controllers/companyController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.use(protect, adminOnly);

router.get("/company", getMyCompany);
router.post("/company", createCompany);
router.put("/company", updateCompany);
router.delete("/company", deleteCompany);

router.get("/branches", getBranches);
router.post("/branches", createBranch);
router.put("/branches/:id", updateBranch);
router.delete("/branches/bulk", bulkDeleteBranches);
router.delete("/branches/:id", deleteBranch);

router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/bulk", bulkDeleteUsers);
router.delete("/users/:id", deleteUser);

router.get("/dispatches", listDispatches);
router.patch("/dispatches/:id/status", updateDispatchStatus);
router.put("/dispatches/:id", updateDispatch);
router.delete("/dispatches/bulk", bulkDeleteDispatches);
router.delete("/dispatches/:id", deleteDispatch);

export default router;
