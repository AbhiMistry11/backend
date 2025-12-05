import { Attendance, Employee } from "../models/index.js";
import { Op } from "sequelize";

export const markInService = async (employeeId) => {
  const today = new Date().toISOString().split("T")[0];

  const existing = await Attendance.findOne({
    where: { employeeId, date: today },
  });

  if (existing && existing.markIn) {
    throw new Error("Already marked in for today");
  }

  if (existing) {
    existing.markIn = new Date();
    await existing.save();
    return existing;
  }

  return Attendance.create({
    employeeId,
    date: today,
    markIn: new Date(),
  });
};

export const markOutService = async (employeeId) => {
  const today = new Date().toISOString().split("T")[0];

  const attendance = await Attendance.findOne({
    where: { employeeId, date: today },
  });

  if (!attendance?.markIn) throw new Error("Mark in first");
  if (attendance.markOut) throw new Error("Already marked out today");

  attendance.markOut = new Date();
  await attendance.save();
  return attendance;
};

export const getMyAttendanceService = async (employeeId) => {
  return Attendance.findAll({
    where: { employeeId },
    order: [["date", "DESC"]],
  });
};
