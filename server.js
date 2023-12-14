const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`Client connected with ID ${socket.id} and user ID ${userId}`);

  socket.on("disconnect", () => {
    console.log(
      `Client disconnected with ID ${socket.id} and user ID ${userId}`
    );
    // Handle disconnection, update database, etc.
  });

  // Add your other event handlers here

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

const PORT = process.env.PORT || 9320;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
