// src/services/leave.service.js
import { Employee, LeaveRequest } from "../models/index.js";

// EMPLOYEE: apply for leave
export const applyLeaveService = async (employeeId, data) => {
  const { leaveType, fromDate, toDate, reason } = data;

  if (!leaveType || !fromDate || !toDate) {
    throw new Error("leaveType, fromDate and toDate are required");
  }

  // TODO later: check overlapping dates with existing approved leaves

  const leave = await LeaveRequest.create({
    employeeId,
    leaveType,
    fromDate,
    toDate,
    reason,
    status: "PENDING",
  });

  return leave;
};

// EMPLOYEE: my leave history
export const getMyLeavesService = async (employeeId) => {
  return LeaveRequest.findAll({
    where: { employeeId },
    order: [["fromDate", "DESC"]],
  });
};

// MANAGER / ADMIN: pending leaves
export const getPendingLeavesService = async (user) => {
  const whereLeave = { status: "PENDING" };
  const include = [
    {
      model: Employee,
      as: "employee",
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

    // Manager sees only leaves from same department
    include[0].where = { department: managerEmp.department };
  }

  const requests = await LeaveRequest.findAll({
    where: whereLeave,
    include,
    order: [["fromDate", "ASC"]],
  });

  return requests;
};

// MANAGER / ADMIN: approve or reject
export const updateLeaveStatusService = async (user, leaveId, newStatus) => {
  if (!["APPROVED", "REJECTED"].includes(newStatus)) {
    throw new Error("Invalid leave status");
  }

  const leave = await LeaveRequest.findByPk(leaveId, {
    include: [
      {
        model: Employee,
        as: "employee",
      },
    ],
  });

  if (!leave) {
    throw new Error("Leave request not found");
  }

  if (leave.status !== "PENDING") {
    throw new Error("Leave already processed");
  }

  // If MANAGER, ensure same department
  if (user.role === "MANAGER") {
    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp || managerEmp.department !== leave.employee.department) {
      throw new Error("Not allowed to approve/reject this leave");
    }
  }

  leave.status = newStatus;
  leave.approverId = user.employeeId || null;
  await leave.save();

  return leave;
};
