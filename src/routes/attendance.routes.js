import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  markInController,
  markOutController,
  myAttendanceController,
} from "../controllers/attendance.controller.js";

const router = Router();

router.post("/mark-in", authMiddleware, markInController);
router.post("/mark-out", authMiddleware, markOutController);
router.get("/my", authMiddleware, myAttendanceController);

export default router;
