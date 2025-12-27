import { Attendance, LeaveRequest, Worklog, Task, Employee } from "../models/index.js";

// ATTENDANCE REPORT
export const getAttendanceReport = async () => {
  const records = await Attendance.findAll({
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["fullName", "department", "designation"],
      },
    ],
    order: [["date", "DESC"]],
  });

  return records.map((r) => ({
    date: r.date,
    markIn: r.markIn,
    markOut: r.markOut,
    status: r.status,
    employeeName: r.employee?.fullName,
    department: r.employee?.department,
    designation: r.employee?.designation,
  }));
};


// LEAVE REPORT
export const getLeaveReport = async () => {
  try {
    const records = await LeaveRequest.findAll({
      include: [
        {
          model: Employee,
          as: "employee",
          attributes: ["fullName", "department", "designation"],
        },
      ],
      order: [["fromDate", "DESC"]],
    });

    return records.map((r) => ({
      employeeName: r.employee?.fullName,
      department: r.employee?.department,
      designation: r.employee?.designation,
      leaveType: r.leaveType,
      fromDate: r.fromDate,
      toDate: r.toDate,
      status: r.status,
    }));
  } catch (err) {
    console.error("❌ Leave report error:", err);
    throw err;
  }
};


// WORKLOG REPORT
export const getWorklogReport = async () => {
  const records = await Worklog.findAll({
    include: [
      {
        model: Employee,
        as: "employee",
        attributes: ["fullName", "department"],
      },
    ],
    order: [["date", "DESC"]],
  });

  return records.map((r) => ({
    date: r.date,
    description: r.description,
    hoursWorked: r.hoursWorked,
    employeeName: r.employee?.fullName,
    department: r.employee?.department,
  }));
};


// TASK REPORT
export const getTaskReport = async () => {
  const records = await Task.findAll({
    include: [
      { model: Employee, as: "assignee", attributes: ["fullName"] },
      { model: Employee, as: "assigner", attributes: ["fullName"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return records.map((r) => ({
    title: r.title,
    status: r.status,
    priority: r.priority,
    dueDate: r.dueDate,
    assignedTo: r.assignee?.fullName,
    assignedBy: r.assigner?.fullName,
  }));
};
