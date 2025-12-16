import { User, Employee } from "../models/index.js";
import { hashPassword } from "../utils/password.js";
import { LeaveType, EmployeeLeaveBalance } from "../models/index.js";


export const createEmployeeService = async (data) => {
  const CURRENT_YEAR = new Date().getFullYear();
  const {
    email,
    password,
    role,
    fullName,
    employeeCode,
    department,
    designation,
    dateOfJoining,
  } = data;

  // Check duplicate email
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new Error("Email already registered");

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
    role, // EMPLOYEE or MANAGER
    isActive: true,
  });

  // Create employee profile
  const employee = await Employee.create({
    userId: user.id,
    fullName,
    employeeCode,
    department,
    designation,
    dateOfJoining,
  });
  
  // after employee is created successfully
  const leaveTypes = await LeaveType.findAll({ where: { isActive: true } });
  
  for (const type of leaveTypes) {
    await EmployeeLeaveBalance.create({
      employeeId: employee.id,
      leaveTypeId: type.id,
      year: CURRENT_YEAR,
      total: type.yearlyLimit,
      used: 0,
      remaining: type.yearlyLimit,
    });
  }
  return { user, employee };
};

export const getEmployeesService = async () => {
  const employees = await User.findAll({
    where: { isActive: true },
    include: [
      {
        model: Employee,
        as: "employeeProfile",
      },
    ],
    order: [["id", "ASC"]],
  });

  return employees;
};
