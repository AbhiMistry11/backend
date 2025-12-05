// src/services/manager.service.js
import { Employee, Attendance } from "../models/index.js";

export const getTodayTeamAttendanceService = async (user) => {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Build where condition for Employee table
  const employeeWhere = {};

  if (user.role === "MANAGER") {
    if (!user.employeeId) {
      throw new Error("Manager employee profile not linked");
    }

    // Find manager's own employee profile to get department
    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp) {
      throw new Error("Manager employee profile not found");
    }

    // Manager only sees their department
    employeeWhere.department = managerEmp.department;
  }

  // ADMIN: employeeWhere is empty → sees all employees

  const employees = await Employee.findAll({
    where: employeeWhere,
    include: [
      {
        model: Attendance,
        as: "attendanceRecords",
        where: { date: today },
        required: false, // so employees with no attendance row still appear
      },
    ],
    order: [["fullName", "ASC"]],
  });

  // Build clean response
  const result = employees.map((emp) => {
    const todayRecord =
      emp.attendanceRecords && emp.attendanceRecords.length > 0
        ? emp.attendanceRecords[0]
        : null;

    let status = "ABSENT";
    let markIn = null;
    let markOut = null;

    if (todayRecord) {
      markIn = todayRecord.markIn;
      markOut = todayRecord.markOut;

      if (markIn && markOut) status = "PRESENT";
      else if (markIn && !markOut) status = "PRESENT_NO_LOGOUT";
    }

    return {
      fullName: emp.fullName,
      employeeCode: emp.employeeCode,
      department: emp.department,
      designation: emp.designation,
      status,
      markIn,
      markOut,
    };
  });

  return result;
};
