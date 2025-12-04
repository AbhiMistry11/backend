// src/models/index.js
import { defineUserModel } from "./user.model.js";
import { defineEmployeeModel } from "./employee.model.js";

let User;
let Employee;

export const setupModels = (sequelize) => {
  // Define models
  User = defineUserModel(sequelize);
  Employee = defineEmployeeModel(sequelize);

  // Associations
  User.hasOne(Employee, {
    foreignKey: "userId",
    as: "employeeProfile",
  });

  Employee.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });
};

// Export models so we can use them in services/controllers
export { User, Employee };
