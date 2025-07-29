const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:8000";
const MEETING_ID = "abc123"; // Use a valid one
const TOKEN = "Bearer YOUR_VALID_JWT";

// Simulate N users
const USERS = [
  { name: "UserA", email: "usera@example.com" },
  { name: "UserB", email: "userb@example.com" },
  { name: "UserC", email: "userC@example.com" },
];

USERS.forEach((user) => {
  const socket = io(SERVER_URL, {
    transports: ["websocket"],
    auth: {
      token: TOKEN,
    },
  });

  socket.on("connect", () => {
    console.log(`✅ ${user.name} connected with socket ID: ${socket.id}`);
    socket.emit("join-room", { meetingId: MEETING_ID, user });
  });

  socket.on("participant-update", (participants) => {
    const names = participants.map((p) => p.name).join(", ");
    console.log(`👥 ${user.name} sees participants: [ ${names} ]`);
  });

  socket.on("meeting-ended", () => {
    console.log(`❌ ${user.name} - Meeting has ended.`);
    socket.disconnect();
  });

//   setTimeout(() => {
//     console.log(`👋 ${user.name} is leaving...`);
//     socket.disconnect();
//   }, 30000);
});
