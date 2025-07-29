const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // Express app
const dotenv = require("dotenv");
const { port } = require("./config");

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to your frontend
    credentials: true,
  },
});

// Map<roomId, Map<email, { socketId, name, email }>>
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // ========== JOIN ROOM ==========
  socket.on("join", ({ roomId, name, email }) => {
    console.log(`📥 ${email} (${name}) joined room ${roomId} with socket ${socket.id}`);

    // Store user info in socket
    socket.data.email = email;
    socket.data.name = name;
    socket.data.roomId = roomId;

    // Ensure room exists
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const userMap = rooms.get(roomId);

    // Check if email already exists in this room
    if (userMap.has(email)) {
      socket.emit("error", { message: "Email already joined in this room" });
      return;
    }

    // Store user in room
    userMap.set(email, {
      socketId: socket.id,
      name,
      email,
    });

    socket.join(roomId);

    // Inform new user about others
    const otherUsers = Array.from(userMap.entries())
      .filter(([otherEmail]) => otherEmail !== email)
      .map(([_, user]) => ({
        socketId: user.socketId,
        name: user.name,
        email: user.email,
      }));

    socket.emit("all-users", otherUsers);

    // Notify others about new user
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      name,
      email,
    });

    console.log("✅ Current Room State:");
    console.log(
      JSON.stringify(
        Array.from(rooms.entries()).reduce((acc, [rid, map]) => {
          acc[rid] = Object.fromEntries(map.entries());
          return acc;
        }, {}),
        null,
        2
      )
    );
  });

  // ========== SIGNALING (Offer, Answer, ICE) ==========
  socket.on("signal", ({ type, to, offer, answer, candidate }) => {
    const payload = { from: socket.id };

    if (type === "offer") payload.offer = offer;
    else if (type === "answer") payload.answer = answer;
    else if (type === "ice-candidate") payload.candidate = candidate;

    io.to(to).emit("signal", { type, ...payload });
  });

  // ========== MANUAL LEAVE ==========
  socket.on("user-left", ({ roomId }) => {
    console.log("👋 User manually left room:", roomId, "Socket ID:", socket.id);
    socket.to(roomId).emit("user-left", socket.id);
  });

  // ========== DISCONNECT ==========
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    const roomId = socket.data.roomId;
    const email = socket.data.email;

    if (!roomId || !rooms.has(roomId)) return;

    const userMap = rooms.get(roomId);
    userMap.delete(email);

    socket.to(roomId).emit("user-left", socket.id);
    console.log(`🧹 Removed ${email} from room ${roomId}`);

    if (userMap.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Deleted empty room ${roomId}`);
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
