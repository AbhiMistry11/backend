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
console.log("User found:", user?.dataValues);
console.log("Password entered:", password);
console.log("Password hash in DB:", user?.passwordHash);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  console.log("isMatch:", isMatch); 
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const tokenPayload = {
    id: user.id,
    role: user.role,
  };

  const token = signToken(tokenPayload);

  // send minimal user data to frontend
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
