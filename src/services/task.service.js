import { Employee, Task } from "../models/index.js";

// MANAGER / ADMIN: assign task to employee
export const createTaskService = async (user, data) => {
  const { title, description, assignedToEmployeeId, priority, dueDate } = data;

  if (!title || !assignedToEmployeeId) {
    throw new Error("title and assignedToEmployeeId are required");
  }

  // ensure assignee exists
  const assignee = await Employee.findByPk(assignedToEmployeeId);
  if (!assignee) {
    throw new Error("Assigned employee not found");
  }

  // if MANAGER → only assign within own department
  if (user.role === "MANAGER") {
    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp) throw new Error("Manager employee profile not found");

    if (managerEmp.department !== assignee.department) {
      throw new Error("Manager can assign tasks only within their department");
    }
  }

  const task = await Task.create({
    title,
    description,
    assignedToEmployeeId,
    assignedByEmployeeId: user.employeeId, // manager/admin employee profile id
    priority: priority || "MEDIUM",
    dueDate: dueDate || null,
  });

  return task;
};

// EMPLOYEE: my tasks
export const getMyTasksService = async (employeeId) => {
  return Task.findAll({
    where: { assignedToEmployeeId: employeeId },
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Employee,
        as: "assigner",
        attributes: ["id", "fullName", "department", "designation"],
      },
    ],
  });
};

// MANAGER / ADMIN: team tasks
export const getTeamTasksService = async (user) => {
  const include = [
    {
      model: Employee,
      as: "assignee",
    },
    {
      model: Employee,
      as: "assigner",
    },
  ];

  const where = {};

  if (user.role === "MANAGER") {
    const managerEmp = await Employee.findByPk(user.employeeId);
    if (!managerEmp) throw new Error("Manager employee profile not found");

    include[0].where = { department: managerEmp.department }; // filter by dept
  }

  const tasks = await Task.findAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
  });

  return tasks;
};

// EMPLOYEE (or MANAGER/ADMIN): update task status
export const updateTaskStatusService = async (user, taskId, newStatus) => {
  if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(newStatus)) {
    throw new Error("Invalid task status");
  }

  const task = await Task.findByPk(taskId);

  if (!task) throw new Error("Task not found");

  // Employee can update only own tasks
  if (user.role === "EMPLOYEE") {
    if (task.assignedToEmployeeId !== user.employeeId) {
      throw new Error("You are not allowed to update this task");
    }
  }

  // Manager/Admin can update any team task → keeping simple for now
  task.status = newStatus;
  await task.save();

  return task;
};
