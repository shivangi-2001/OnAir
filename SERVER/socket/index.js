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

// Map<roomId, Map<email, { socketId, name }>>
const rooms = new Map();
// i want rooms to be a

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", ({ roomId, name, email }) => {
    console.log(`User ${email} (${name}) joined room ${roomId} with socket ${socket.id}`);
    socket.join(roomId);

    socket.data.email = email;
    socket.data.name = name;
    socket.data.roomId = roomId;

    // Initialize room if not present
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const userMap = rooms.get(roomId);

    // Prevent duplicate emails
    if (userMap.has(email)) {
      const existing = userMap.get(email);
      if (existing.socketId !== socket.id) {
        // console.log(`Replacing stale socket for ${email}`);
        userMap.set(email, { socketId: socket.id, name });
      } else {
        // console.warn(`Email ${email} already joined`);
        return;
      }
    } else {
      userMap.set(email, { socketId: socket.id, name });
    }

    // Send all current users to the newly joined user
    const otherUsers = Array.from(userMap.values())
      .filter((user) => user.socketId !== socket.id)
      .map((user) => ({
        socketId: user.socketId,
        name: user.name,
        email: email,
      }));


    socket.emit("all-users", otherUsers);

    //Notify other users in the room
    socket.to(roomId).emit("user-joined", { socketId: socket.id, name, email });

    console.log("✅ Room state:");
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

  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });


  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    for (const [roomId, userMap] of rooms.entries()) {
      for (const [email, user] of userMap.entries()) {
        if (user.socketId === socket.id) {
          userMap.delete(email);
          socket.to(roomId).emit("user-left", socket.id);
          console.log(`🧹 Removed ${email} from room ${roomId}`);
          break;
        }
      }

      // Clean empty room
      if (userMap.size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️ Deleted empty room ${roomId}`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
