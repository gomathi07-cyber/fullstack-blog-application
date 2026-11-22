import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
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
const app = express();
app.listen(3000, () => {
  console.log("server is running on port 3000!");
});
