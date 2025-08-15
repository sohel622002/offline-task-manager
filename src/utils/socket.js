// socket.js
let io;

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

// Emit to all connected clients
function emitToAll(event, data) {
  if (!io) {
    console.error("Socket.io not initialized!");
    return;
  }
  io.emit(event, data);
}

// Emit to specific socket
function emitToSocket(socketId, event, data) {
  if (!io) {
    console.error("Socket.io not initialized!");
    return;
  }
  io.to(socketId).emit(event, data);
}

module.exports = {
  initSocket,
  emitToAll,
  emitToSocket
};
