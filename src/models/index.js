// src/models/index.js
import { defineUserModel } from "./user.model.js";
import { defineEmployeeModel } from "./employee.model.js";
import { defineAttendanceModel } from "./attendance.model.js";
import { defineLeaveRequestModel } from "./leaveRequest.model.js";
import { defineWorklogModel } from "./worklog.model.js";

let User;
let Employee;
let Attendance;
let LeaveRequest;
let Worklog;

export const setupModels = (sequelize) => {
  // Define models
  User = defineUserModel(sequelize);
  Employee = defineEmployeeModel(sequelize);
  Attendance = defineAttendanceModel(sequelize);
  LeaveRequest = defineLeaveRequestModel(sequelize);
  Worklog = defineWorklogModel(sequelize);

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
};

export { User, Employee, Attendance, LeaveRequest,Worklog };
