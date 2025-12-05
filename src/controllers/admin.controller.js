import { createEmployeeService } from "../services/admin.service.js";
import { getEmployeesService } from "../services/admin.service.js";


export const createEmployeeController = async (req, res) => {
  try {
    const result = await createEmployeeService(req.body);
    res.status(201).json({
      message: "Employee created successfully",
      employee: result.employee,
    });
  } catch (err) {
    console.error("Create employee error:", err.message);
    res.status(400).json({ message: err.message });
  }
};


export const listEmployeesController = async (req, res) => {
  try {
    const list = await getEmployeesService();

    res.json(
      list.map((item) => ({
        id: item.id,
        email: item.email,
        role: item.role,
        employee: item.employeeProfile
          ? {
              fullName: item.employeeProfile.fullName,
              employeeCode: item.employeeProfile.employeeCode,
              department: item.employeeProfile.department,
              designation: item.employeeProfile.designation,
              dateOfJoining: item.employeeProfile.dateOfJoining,
            }
          : null,
      }))
    );
  } catch (err) {
    console.error("List employees error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
