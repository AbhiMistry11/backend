// src/models/index.js
import { defineUserModel } from "./user.model.js";
import { defineEmployeeModel } from "./employee.model.js";
import { defineAttendanceModel } from "./attendance.model.js";

let User;
let Employee;
let Attendance;

export const setupModels = (sequelize) => {
  // Define models
  User = defineUserModel(sequelize);
  Employee = defineEmployeeModel(sequelize);
  Attendance = defineAttendanceModel(sequelize);

  // Associations
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
};

// Export models so we can use them in services/controllers
export { User, Employee, Attendance };
