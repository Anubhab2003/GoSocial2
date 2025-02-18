import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

let activeUsers = {};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("user-joined", (username) => {
        activeUsers[socket.id] = username;
        io.emit("update-active-users", Object.values(activeUsers));
    });

    socket.on("send-message", ({ username, message }) => {
        io.emit("receive-message", { username, message });
    });

    socket.on("disconnect", () => {
        delete activeUsers[socket.id];
        io.emit("update-active-users", Object.values(activeUsers));
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
