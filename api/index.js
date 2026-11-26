import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";

dotenv.config();

// Configure DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// API routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

// Error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// MongoDB connection and server startup
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });
