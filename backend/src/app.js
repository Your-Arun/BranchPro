import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import generalEntryRoutes from "./routes/generalEntryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
  app.use(express.json({ limit: "2mb" }));
  // app.use(morgan("dev")); // Removed to stop loud request logging

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "branchflow-backend" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/dispatches", dispatchRoutes);
  app.use("/api/branches", branchRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/general-entries", generalEntryRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
