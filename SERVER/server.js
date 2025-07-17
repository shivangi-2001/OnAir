const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const dotenv = require("dotenv");
const { port } = require("./config");

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-room", ({ meetingId, user }) => {
    socket.join(meetingId);
    console.log(`👤 ${user?.name || "Unknown user"} joined meeting ${meetingId}`);

    socket.to(meetingId).emit("user-joined", { socketId: socket.id, user });
  });

  socket.on("offer", ({ target, offer }) => {
    io.to(target).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ target, answer }) => {
    io.to(target).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("end-meeting", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((meetingId) => {
      io.to(meetingId).emit("meeting-ended");
    });
    socket.disconnect(true);
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((meetingId) => {
      socket.to(meetingId).emit("user-left", { socketId: socket.id });
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
