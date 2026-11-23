import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";

//configure DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

//configure .env
dotenv.config();

// Connecting MongoDB
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

//Initialized express app
const app = express();

//server port
app.listen(process.env.PORT || 3000, () => {
  console.log(`server is running on port ${process.env.PORT} !`);
});

// to read the json request
app.use(express.json());

//API routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

// handling error
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
