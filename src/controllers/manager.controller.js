// src/controllers/manager.controller.js
import { getTodayTeamAttendanceService } from "../services/manager.service.js";

export const todayTeamAttendanceController = async (req, res) => {
  try {
    const user = req.user; // { id, role, employeeId }
    const data = await getTodayTeamAttendanceService(user);
    res.json(data);
  } catch (err) {
    console.error("Today team attendance error:", err.message);
    res.status(400).json({ message: err.message });
  }
};
