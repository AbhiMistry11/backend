import { Router } from "express";
import { loginController, meController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Login
router.post("/login", loginController);

// Current logged-in user
router.get("/getUser", authMiddleware, meController);

export default router;