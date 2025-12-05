// src/services/auth.service.js
import { User, Employee } from "../models/index.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const loginService = async (email, password) => {
  const user = await User.findOne({
    where: { email, isActive: true },
    include: [
      {
        model: Employee,
        as: "employeeProfile",
      },
    ],
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // 🔥 IMPORTANT — include employeeId in JWT payload
  const tokenPayload = {
    id: user.id,
    role: user.role,
    employeeId: user.employeeProfile ? user.employeeProfile.id : null,
  };

  const token = signToken(tokenPayload);

  return {
    token,
    user: {
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
    },
  };
};
