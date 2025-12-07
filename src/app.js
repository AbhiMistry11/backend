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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LiteHR backend running" });
});

export default app;
