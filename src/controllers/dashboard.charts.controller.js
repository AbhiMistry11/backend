import {
  adminMonthlyAttendanceService,
  adminMonthlyLeaveService,
  departmentEmployeeCountService,
  managerMonthlyAttendanceService,
  managerMonthlyLeaveService,
} from "../services/dashboard.charts.service.js";

// ADMIN
export const adminChartsController = async (req, res) => {
  try {
    const attendance = await adminMonthlyAttendanceService();
    const leaves = await adminMonthlyLeaveService();
    const departments = await departmentEmployeeCountService();

    res.json({ attendance, leaves, departments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MANAGER
export const managerChartsController = async (req, res) => {
  try {
    const attendance = await managerMonthlyAttendanceService(req.user.employeeId);
    const leaves = await managerMonthlyLeaveService(req.user.employeeId);

    res.json({ attendance, leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
