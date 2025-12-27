import { Router } from "express";
import {
  exportAttendanceCSV,
  exportLeaveCSV,
  exportWorklogCSV,
  exportTaskCSV,
} from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/attendance", authMiddleware, exportAttendanceCSV);
router.get("/leave", authMiddleware, exportLeaveCSV);
router.get("/worklogs", authMiddleware, exportWorklogCSV);
router.get("/tasks", authMiddleware, exportTaskCSV);

export default router;
