import { DataTypes } from "sequelize";

export const defineLeaveTypeModel = (sequelize) => {
  const LeaveType = sequelize.define(
    "LeaveType",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      yearlyLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "leave_types",
      timestamps: true,
    }
  );

  return LeaveType;
};
