const { io } = require("socket.io-client");
const socket = io("https://copy-paste-lab.onrender.com");

socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
  socket.emit("join-session", "12345678");
});

socket.on("session-history", (history) => {
  console.log("Got history:", history);
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
  process.exit(1);
});
