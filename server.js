const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_, res) => res.json({ ok: true }));

const rooms = new Map();
function roomFor(code) {
  if (!rooms.has(code)) rooms.set(code, { cameras: new Map(), viewers: new Map() });
  return rooms.get(code);
}
function remove(s) {
  const code = s.data.code, role = s.data.role;
  if (!code || !role) return;
  const r = rooms.get(code);
  if (!r) return;
  (role === "camera" ? r.cameras : r.viewers).delete(s.id);
  io.to(code).emit(role === "camera" ? "camera-removed" : "viewer-removed", { id: s.id });
  s.data.code = null; s.data.role = null;
  if (!r.cameras.size && !r.viewers.size) rooms.delete(code);
}
io.on("connection", socket => {
  socket.on("join", ({ code, role, label } = {}) => {
    if (typeof code !== "string" || !/^[A-Za-z0-9-]{4,32}$/.test(code) ||
        !["camera", "viewer"].includes(role)) {
      socket.emit("app-error", "Use a room code with 4–32 letters, numbers, or hyphens.");
      return;
    }
    if (socket.data.code) remove(socket);
    socket.data.code = code; socket.data.role = role;
    socket.data.label = String(label || role).slice(0, 50);
    socket.join(code);
    const r = roomFor(code), item = { id: socket.id, label: socket.data.label };
    if (role === "camera") r.cameras.set(socket.id, { ...item, active: false });
    else r.viewers.set(socket.id, item);
    socket.emit("joined", {
      cameras: [...r.cameras.values()].filter(c => c.active),
      viewers: [...r.viewers.values()]
    });
    if (role === "viewer") socket.to(code).emit("viewer-added", item);
  });
  socket.on("camera-started", () => {
    const code = socket.data.code;
    if (!code || socket.data.role !== "camera") return;
    const r = rooms.get(code), camera = r && r.cameras.get(socket.id);
    if (!camera) return;
    camera.active = true;
    io.to(code).emit("camera-added", { id: socket.id, label: camera.label });
  });
  socket.on("camera-stopped", () => {
    const code = socket.data.code;
    if (!code || socket.data.role !== "camera") return;
    const r = rooms.get(code), camera = r && r.cameras.get(socket.id);
    if (!camera) return;
    camera.active = false;
    io.to(code).emit("camera-removed", { id: socket.id });
  });
  socket.on("signal", ({ to, data } = {}) => {
    const code = socket.data.code;
    if (!code || typeof to !== "string" || !data) return;
    const r = rooms.get(code);
    if (!r || (!r.cameras.has(to) && !r.viewers.has(to))) return;
    io.to(to).emit("signal", { from: socket.id, data });
  });
  socket.on("leave", () => { const code = socket.data.code; remove(socket); if (code) socket.leave(code); });
  socket.on("disconnect", () => remove(socket));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => console.log("Server listening on " + PORT));
