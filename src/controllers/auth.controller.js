// src/controllers/auth.controller.js
import { loginService } from "../services/auth.service.js";
import { User, Employee } from "../models/index.js";


export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await loginService(email, password);

    res.json({
      message: "Login successful",
      ...result,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(401).json({ message: err.message || "Login failed" });
  }
};

export const meController = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Employee,
          as: "employeeProfile",
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employeeProfile
        ? {
            id: user.employeeProfile.id,
            fullName: user.employeeProfile.fullName,
            employeeCode: user.employeeProfile.employeeCode,
            department: user.employeeProfile.department,
            designation: user.employeeProfile.designation,
          }
        : null,
    });
  } catch (err) {
    console.error("ME error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
