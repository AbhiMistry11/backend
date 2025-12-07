// src/services/dashboard.service.js
import { Op } from "sequelize";
import {
  User,
  Employee,
  Attendance,
  LeaveRequest,
  Worklog,
} from "../models/index.js";

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

// Admin dashboard summary
export const getAdminDashboardService = async () => {
  const today = getTodayDateString();

  const [totalEmployees, totalActiveUsers, presentToday, onLeaveToday, pendingLeaves, recentWorklogs] =
    await Promise.all([
      Employee.count(),

      User.count({ where: { isActive: true } }),

      Attendance.count({
        where: { date: today, markIn: { [Op.ne]: null } },
      }),

      LeaveRequest.count({
        where: {
          status: "APPROVED",
          fromDate: { [Op.lte]: today },
          toDate: { [Op.gte]: today },
        },
      }),

      LeaveRequest.count({
        where: { status: "PENDING" },
      }),

      Worklog.findAll({
        include: [
          {
            model: Employee,
            as: "employee",
          },
        ],
        order: [["date", "DESC"]],
        limit: 5,
      }),
    ]);

  const recentWorklogsMapped = recentWorklogs.map((log) => ({
    id: log.id,
    date: log.date,
    description: log.description,
    hoursWorked: log.hoursWorked,
    employee: log.employee
      ? {
          id: log.employee.id,
          fullName: log.employee.fullName,
          department: log.employee.department,
          designation: log.employee.designation,
        }
      : null,
  }));

  return {
    totalEmployees,
    totalActiveUsers,
    presentToday,
    onLeaveToday,
    pendingLeaves,
    recentWorklogs: recentWorklogsMapped,
  };
};

// Manager dashboard summary (based on manager's department)
export const getManagerDashboardService = async (user) => {
  const today = getTodayDateString();

  if (!user.employeeId) {
    throw new Error("Manager employee profile not linked");
  }

  const managerEmp = await Employee.findByPk(user.employeeId);
  if (!managerEmp) throw new Error("Manager employee profile not found");

  const dept = managerEmp.department;

  const [teamMembers, presentTodayTeam, onLeaveTodayTeam, pendingLeavesTeam, recentTeamWorklogs] =
    await Promise.all([
      Employee.findAll({ where: { department: dept } }),

      Attendance.count({
        include: [
          {
            model: Employee,
            as: "employee",
            where: { department: dept },
          },
        ],
        where: {
          date: today,
          markIn: { [Op.ne]: null },
        },
      }),

      LeaveRequest.count({
        include: [
          {
            model: Employee,
            as: "employee",
            where: { department: dept },
          },
        ],
        where: {
          status: "APPROVED",
          fromDate: { [Op.lte]: today },
          toDate: { [Op.gte]: today },
        },
      }),

      LeaveRequest.count({
        include: [
          {
            model: Employee,
            as: "employee",
            where: { department: dept },
          },
        ],
        where: {
          status: "PENDING",
        },
      }),

      Worklog.findAll({
        include: [
          {
            model: Employee,
            as: "employee",
            where: { department: dept },
          },
        ],
        order: [["date", "DESC"]],
        limit: 5,
      }),
    ]);

  const recentWorklogsMapped = recentTeamWorklogs.map((log) => ({
    id: log.id,
    date: log.date,
    description: log.description,
    hoursWorked: log.hoursWorked,
    employee: {
      id: log.employee.id,
      fullName: log.employee.fullName,
      department: log.employee.department,
      designation: log.employee.designation,
    },
  }));

  return {
    department: dept,
    teamSize: teamMembers.length,
    presentToday: presentTodayTeam,
    onLeaveToday: onLeaveTodayTeam,
    pendingLeaves: pendingLeavesTeam,
    recentWorklogs: recentWorklogsMapped,
  };
};
