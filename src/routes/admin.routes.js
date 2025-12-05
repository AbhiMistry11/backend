import { Router } from "express";
import { createEmployeeController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { listEmployeesController } from "../controllers/admin.controller.js";

const router = Router();

// ADMIN → Create Employee
router.post(
  "/employees",
  authMiddleware,
  checkRole(["ADMIN"]),
  createEmployeeController
);


router.get(
  "/employees",
  authMiddleware,
  checkRole(["ADMIN"]),
  listEmployeesController
);

export default router;
