// src/services/leave.service.js
import {
  Employee,
  LeaveRequest,
  LeaveType,
  EmployeeLeaveBalance,
} from "../models/index.js";
import { Op } from "sequelize";

const CURRENT_YEAR = new Date().getFullYear();

const calculateDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// ================= EMPLOYEE =================

// Apply for leave
export const applyLeaveService = async (employeeId, data) => {
  const { leaveType, fromDate, toDate, reason } = data;

  if (!leaveType || !fromDate || !toDate) {
    throw new Error("leaveType, fromDate and toDate are required");
  }

  const days = calculateDays(fromDate, toDate);

  // 1️⃣ Validate leave type
  const type = await LeaveType.findOne({ where: { code: leaveType } });
  if (!type) {
    throw new Error("Invalid leave type");
  }

  // 2️⃣ Check leave balance
  const balance = await EmployeeLeaveBalance.findOne({
    where: {
      employeeId,
      leaveTypeId: type.id,
      year: CURRENT_YEAR,
    },
  });

  if (!balance || balance.remaining < days) {
    throw new Error("Insufficient leave balance");
  }
  // 🔴 LEAVE COLLISION CHECK
  const employee = await Employee.findByPk(employeeId);

  const collisions = await LeaveRequest.findAll({
    where: {
      status: ["PENDING", "APPROVED"],
      fromDate: { [Op.lte]: toDate },
      toDate: { [Op.gte]: fromDate },
    },
    include: [
      {
        model: Employee,
        as: "employee",
        where: {
          department: employee.department,
          designation: employee.designation,
        },
      },
    ],
  });

  const hasCollision = collisions.length > 0;
  const collisionCount = collisions.length;

  // 3️⃣ Create leave request
  const leave = await LeaveRequest.create({
    employeeId,
    leaveType,
    fromDate,
    toDate,
    reason,
    status: "PENDING",
    hasCollision,
    collisionCount,
  });

  return leave;
};

// My leave history
export const getMyLeavesService = async (employeeId) => {
  return LeaveRequest.findAll({
    where: { employeeId },
    order: [["fromDate", "DESC"]],
  });
};

// ================= MANAGER / ADMIN =================

// MANAGER / ADMIN: pending leaves (with collision info)
export const getPendingLeavesService = async (user) => {
  const whereLeave = { status: "PENDING" };

  const include = [
    {
      model: Employee,
      as: "employee",
      attributes: ["id", "fullName", "department", "designation"],
    },
  ];

  if (user.role === "MANAGER") {
    if (!user.employeeId) {
      throw new Error("Manager employee profile not linked");
    }

    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp) {
      throw new Error("Manager employee profile not found");
    }

    // Manager sees only department leaves
    include[0].where = { department: managerEmp.department };
  }

  const leaves = await LeaveRequest.findAll({
    where: whereLeave,
    include,
    order: [["fromDate", "ASC"]],
  });

  // Explicit collision info for frontend
  return leaves.map((leave) => ({
    id: leave.id,
    employeeId: leave.employee.id,
    employeeName: leave.employee.fullName,
    department: leave.employee.department,
    designation: leave.employee.designation,
    leaveType: leave.leaveType,
    fromDate: leave.fromDate,
    toDate: leave.toDate,
    reason: leave.reason,
    hasCollision: leave.hasCollision,
    collisionCount: leave.collisionCount,
    status: leave.status,
    createdAt: leave.createdAt,
  }));
};

// Approve / Reject leave
export const updateLeaveStatusService = async (user, leaveId, newStatus) => {
  if (!["APPROVED", "REJECTED"].includes(newStatus)) {
    throw new Error("Invalid leave status");
  }

  const leave = await LeaveRequest.findByPk(leaveId, {
    include: [{ model: Employee, as: "employee" }],
  });

  if (!leave) {
    throw new Error("Leave request not found");
  }

  if (leave.status !== "PENDING") {
    throw new Error("Leave already processed");
  }

  // Manager department check
  if (user.role === "MANAGER") {
    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp || managerEmp.department !== leave.employee.department) {
      throw new Error("Not allowed to approve/reject this leave");
    }
  }

  // If APPROVED → deduct balance
  if (newStatus === "APPROVED") {
    const days = calculateDays(leave.fromDate, leave.toDate);

    const type = await LeaveType.findOne({
      where: { code: leave.leaveType },
    });

    const balance = await EmployeeLeaveBalance.findOne({
      where: {
        employeeId: leave.employeeId,
        leaveTypeId: type.id,
        year: CURRENT_YEAR,
      },
    });

    if (!balance || balance.remaining < days) {
      throw new Error("Insufficient leave balance");
    }

    balance.used += days;
    balance.remaining -= days;
    await balance.save();
  }

  leave.status = newStatus;
  leave.approverId = user.employeeId || null;
  await leave.save();

  return leave;
};
