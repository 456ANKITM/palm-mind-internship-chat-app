import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import authRoutes from "./routes/authRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import http from "http"
import cors from "cors"
import { initSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

await connectDB();
await connectCloudinary();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173" || "https://palm-mind-internship-chat-ad2iawo9j.vercel.app/",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/message", messageRoutes);

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});