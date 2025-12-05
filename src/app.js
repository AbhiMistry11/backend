import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import managerRoutes from "./routes/manager.routes.js";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/manager", managerRoutes);


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "LiteHR backend running" });
});

export default app;
