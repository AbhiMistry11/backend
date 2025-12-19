import {
  Employee,
  LeaveRequest,
  LeaveType,
  EmployeeLeaveBalance,
} from "../models/index.js";
import { Op } from "sequelize";
import { createNotification } from "./notification.service.js";

const CURRENT_YEAR = new Date().getFullYear();

// Helper: calculate number of leave days
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

  // 3️⃣ Get employee profile
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  // 4️⃣ LEAVE COLLISION CHECK (exclude self)
  const collisions = await LeaveRequest.findAll({
    where: {
      employeeId: { [Op.ne]: employeeId },
      status: { [Op.in]: ["PENDING", "APPROVED"] },
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

  // 5️⃣ Create leave request
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

  // 6️⃣ Notify managers of the department
  const managers = await Employee.findAll({
    where: {
      department: employee.department,
      designation: { [Op.like]: "%Manager%" },
    },
  });

  for (const manager of managers) {
    await createNotification({
      userId: manager.userId,
      title: "New Leave Request",
      message: `${employee.fullName} applied for leave`,
      type: "LEAVE",
    });
  }

  return leave;
};

// Employee: my leave history
export const getMyLeavesService = async (employeeId) => {
  return LeaveRequest.findAll({
    where: { employeeId },
    order: [["fromDate", "DESC"]],
  });
};

// ================= MANAGER / ADMIN =================

// Pending leaves (with collision info)
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

    include[0].where = { department: managerEmp.department };
  }

  const leaves = await LeaveRequest.findAll({
    where: whereLeave,
    include,
    order: [["fromDate", "ASC"]],
  });

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

  // Notify employee
  await createNotification({
    userId: leave.employee.userId,
    title: "Leave Status Updated",
    message: `Your leave has been ${newStatus}`,
    type: "LEAVE",
  });

  return leave;
};
