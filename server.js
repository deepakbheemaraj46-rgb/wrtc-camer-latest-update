const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", ({ room, role } = {}) => {
    if (typeof room !== "string" || !/^[A-Za-z0-9_-]{4,32}$/.test(room)) {
      socket.emit("app-error", "Room code must be 4–32 letters, numbers, _ or -.");
      return;
    }
    if (!["broadcaster", "viewer"].includes(role)) {
      socket.emit("app-error", "Invalid room role.");
      return;
    }

    const members = rooms.get(room) || { broadcaster: null, viewers: new Set() };

    if (role === "broadcaster") {
      if (members.broadcaster && members.broadcaster !== socket.id) {
        socket.emit("app-error", "This room already has a sharing device connected.");
        return;
      }
      members.broadcaster = socket.id;
    } else {
      members.viewers.add(socket.id);
    }

    rooms.set(room, members);
    socket.data.room = room;
    socket.data.role = role;
    socket.join(room);

    if (role === "broadcaster") {
      socket.emit("room-joined", { room, role });
      for (const viewerId of members.viewers) {
        io.to(socket.id).emit("viewer-ready", { viewerId });
      }
    } else {
      socket.emit("room-joined", { room, role, broadcasterOnline: Boolean(members.broadcaster) });
      if (members.broadcaster) io.to(members.broadcaster).emit("viewer-ready", { viewerId: socket.id });
    }
  });

  socket.on("webrtc-offer", ({ to, offer } = {}) => {
    if (!to || !offer || socket.data.role !== "broadcaster") return;
    io.to(to).emit("webrtc-offer", { from: socket.id, offer });
  });

  socket.on("webrtc-answer", ({ to, answer } = {}) => {
    if (!to || !answer || socket.data.role !== "viewer") return;
    io.to(to).emit("webrtc-answer", { from: socket.id, answer });
  });

  socket.on("webrtc-ice", ({ to, candidate } = {}) => {
    if (!to || !candidate) return;
    const allowed = socket.data.role === "broadcaster" || socket.data.role === "viewer";
    if (allowed) io.to(to).emit("webrtc-ice", { from: socket.id, candidate });
  });

  socket.on("stop-sharing", () => {
    const room = socket.data.room;
    if (room) socket.to(room).emit("sharing-stopped");
  });

  socket.on("disconnect", () => {
    const room = socket.data.room;
    if (!room) return;
    const members = rooms.get(room);
    if (!members) return;

    if (socket.data.role === "broadcaster" && members.broadcaster === socket.id) {
      members.broadcaster = null;
      socket.to(room).emit("sharing-stopped");
    } else {
      members.viewers.delete(socket.id);
    }

    if (!members.broadcaster && members.viewers.size === 0) rooms.delete(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Camera Stream app running at http://localhost:${PORT}`);
});
