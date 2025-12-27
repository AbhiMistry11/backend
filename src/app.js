import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import worklogRoutes from "./routes/worklog.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import taskRoutes from "./routes/task.routes.js";
import leaveTypeRoutes from "./routes/leaveType.routes.js";
import leaveBalanceRoutes from "./routes/leaveBalance.routes.js";
import dashboardChartsRoutes from "./routes/dashboard.charts.routes.js";
import employeeDashboardRoutes from "./routes/employee.dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/worklogs", worklogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/leavetypes", leaveTypeRoutes);
app.use("/api/leavebalance", leaveBalanceRoutes);
app.use("/api/dashboard/charts", dashboardChartsRoutes);
app.use("/api/dashboard", employeeDashboardRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LiteHR backend running" });
});

export default app;
