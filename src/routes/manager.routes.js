// src/routes/manager.routes.js
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { todayTeamAttendanceController } from "../controllers/manager.controller.js";

const router = Router();

// MANAGER + ADMIN access
router.get(
  "/attendance/today",
  authMiddleware,
  checkRole(["MANAGER", "ADMIN"]),
  todayTeamAttendanceController
);

export default router;
