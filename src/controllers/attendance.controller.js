import {
  markInService,
  markOutService,
  getMyAttendanceService,
} from "../services/attendance.service.js";

export const markInController = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const result = await markInService(employeeId);
    res.json({ message: "Marked in successfully", attendance: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const markOutController = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const result = await markOutService(employeeId);
    res.json({ message: "Marked out successfully", attendance: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const myAttendanceController = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const result = await getMyAttendanceService(employeeId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
