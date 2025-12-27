import { Parser } from "json2csv";
import {
  getAttendanceReport,
  getLeaveReport,
  getWorklogReport,
  getTaskReport,
} from "../services/report.service.js";

const exportCSV = (res, data, fileName) => {
  const parser = new Parser();
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment(fileName);
  return res.send(csv);
};

// ATTENDANCE CSV
export const exportAttendanceCSV = async (req, res) => {
  const data = await getAttendanceReport();
  exportCSV(res, data, "attendance_report.csv");
};

// LEAVE CSV
export const exportLeaveCSV = async (req, res) => {
  const data = await getLeaveReport();
  exportCSV(res, data, "leave_report.csv");
};

// WORKLOG CSV
export const exportWorklogCSV = async (req, res) => {
  const data = await getWorklogReport();
  exportCSV(res, data, "worklog_report.csv");
};

// TASK CSV
export const exportTaskCSV = async (req, res) => {
  const data = await getTaskReport();
  exportCSV(res, data, "task_report.csv");
};
