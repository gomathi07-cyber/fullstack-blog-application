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
app.listen(3000, () => {
  console.log("server is running on port 3000!");
});

// to read the json request
app.use(express.json());

//API routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
