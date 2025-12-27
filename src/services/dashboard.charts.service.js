import { Op, fn, col } from "sequelize";
import { Attendance, LeaveRequest, Employee } from "../models/index.js";

// Helper: current year
const YEAR = new Date().getFullYear();

// ================= ADMIN =================

// Monthly attendance trend (ADMIN)
export const adminMonthlyAttendanceService = async () => {
  const data = await Attendance.findAll({
    attributes: [
      [fn("MONTH", col("date")), "month"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      date: {
        [Op.between]: [`${YEAR}-01-01`, `${YEAR}-12-31`],
      },
      markIn: { [Op.ne]: null },
    },
    group: [fn("MONTH", col("date"))],
    order: [[fn("MONTH", col("date")), "ASC"]],
  });

  return data;
};

// Monthly leave trend (ADMIN)
export const adminMonthlyLeaveService = async () => {
  const data = await LeaveRequest.findAll({
    attributes: [
      [fn("MONTH", col("fromDate")), "month"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      status: "APPROVED",
      fromDate: {
        [Op.between]: [`${YEAR}-01-01`, `${YEAR}-12-31`],
      },
    },
    group: [fn("MONTH", col("fromDate"))],
    order: [[fn("MONTH", col("fromDate")), "ASC"]],
  });

  return data;
};

// Department-wise employee count (ADMIN)
export const departmentEmployeeCountService = async () => {
  return Employee.findAll({
    attributes: [
      "department",
      [fn("COUNT", col("id")), "count"],
    ],
    group: ["department"],
  });
};

// ================= MANAGER =================

// Monthly attendance trend (MANAGER)
export const managerMonthlyAttendanceService = async (managerEmployeeId) => {
  const manager = await Employee.findByPk(managerEmployeeId);
  if (!manager) throw new Error("Manager not found");

  return Attendance.findAll({
    attributes: [
      [fn("MONTH", col("date")), "month"],
      [fn("COUNT", col("id")), "count"],
    ],
    include: [
      {
        model: Employee,
        as: "employee",
        where: { department: manager.department },
      },
    ],
    where: {
      date: {
        [Op.between]: [`${YEAR}-01-01`, `${YEAR}-12-31`],
      },
      markIn: { [Op.ne]: null },
    },
    group: [fn("MONTH", col("date"))],
    order: [[fn("MONTH", col("date")), "ASC"]],
  });
};

// Monthly leave trend (MANAGER)
export const managerMonthlyLeaveService = async (managerEmployeeId) => {
  const manager = await Employee.findByPk(managerEmployeeId);
  if (!manager) throw new Error("Manager not found");

  return LeaveRequest.findAll({
    attributes: [
      [fn("MONTH", col("fromDate")), "month"],
      [fn("COUNT", col("id")), "count"],
    ],
    include: [
      {
        model: Employee,
        as: "employee",
        where: { department: manager.department },
      },
    ],
    where: {
      status: "APPROVED",
      fromDate: {
        [Op.between]: [`${YEAR}-01-01`, `${YEAR}-12-31`],
      },
    },
    group: [fn("MONTH", col("fromDate"))],
    order: [[fn("MONTH", col("fromDate")), "ASC"]],
  });
};
