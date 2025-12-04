// src/models/employee.model.js
import { DataTypes } from "sequelize";

export const defineEmployeeModel = (sequelize) => {
  const Employee = sequelize.define(
    "Employee",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      employeeCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      designation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(100), // later you can switch to department table
        allowNull: true,
      },
      dateOfJoining: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: "employees",
      timestamps: true,
    }
  );

  return Employee;
};
