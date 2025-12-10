// src/models/index.js
import { defineUserModel } from "./user.model.js";
import { defineEmployeeModel } from "./employee.model.js";
import { defineAttendanceModel } from "./attendance.model.js";
import { defineLeaveRequestModel } from "./leaveRequest.model.js";
import { defineWorklogModel } from "./worklog.model.js";
import { defineTaskModel } from "./task.model.js";

let User;
let Employee;
let Attendance;
let LeaveRequest;
let Worklog;
let Task; 

export const setupModels = (sequelize) => {
  // Define models
  User = defineUserModel(sequelize);
  Employee = defineEmployeeModel(sequelize);
  Attendance = defineAttendanceModel(sequelize);
  LeaveRequest = defineLeaveRequestModel(sequelize);
  Worklog = defineWorklogModel(sequelize);
  Task = defineTaskModel(sequelize);  

  // User ↔ Employee
  User.hasOne(Employee, {
    foreignKey: "userId",
    as: "employeeProfile",
  });

  Employee.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // Employee ↔ Attendance (one-to-many)
  Employee.hasMany(Attendance, {
    foreignKey: "employeeId",
    as: "attendanceRecords",
  });

  Attendance.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

  // Employee ↔ LeaveRequest (one-to-many)
  Employee.hasMany(LeaveRequest, {
    foreignKey: "employeeId",
    as: "leaveRequests",
  });

  LeaveRequest.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });

// Employee ↔ Worklog (1-to-many)
  Employee.hasMany(Worklog, {
    foreignKey: "employeeId",
    as: "worklogs",
  });

  Worklog.belongsTo(Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });
  // Employee ↔ Task (assigned to, assigned by)
  Employee.hasMany(Task, {
    foreignKey: "assignedToEmployeeId",
    as: "assignedTasks",
  });

  Employee.hasMany(Task, {
    foreignKey: "assignedByEmployeeId",
    as: "createdTasks",
  });

  Task.belongsTo(Employee, {
    foreignKey: "assignedToEmployeeId",
    as: "assignee",
  });

  Task.belongsTo(Employee, {
    foreignKey: "assignedByEmployeeId",
    as: "assigner",
  });
};

export { User, Employee, Attendance, LeaveRequest,Worklog, Task };
