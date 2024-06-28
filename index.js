import express from "express";
import http from "http";
import dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import { Connection } from "./database/db.js";
import { Server } from "socket.io";

// Routes and model
import UserRouter from "./routes/userRoutes.js";
import User from "./model/userModel.js";
import Chat from "./model/chatModel.js";

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static(path.resolve("./public")));

// Making connection with the DB
Connection();

app.use("/", UserRouter);

const PORT = process.env.PORT || 8000;

// creating socket connection
const server = http.createServer(app);
const io = new Server(server);
const usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  console.log("a user connected");

  const userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });

  // broadcast online status for this user
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async function () {
    console.log("user disconnected");

    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });

    // broadcast offline status for this user
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  // chat controlling
  socket.on("newChat", function (data) {
    socket.broadcast.emit("loadNewChat", data);
  });

  // Load existing chat
  socket.on("existingChats", async function (data) {
    const chats = await Chat.find({
      $or: [
        { sender_id: data.sender_id, reciever_id: data.reciever_id },
        { sender_id: data.reciever_id, reciever_id: data.sender_id },
      ],
    });

    socket.emit("loadExistingChat", { chats: chats });
  });
});

server.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});
